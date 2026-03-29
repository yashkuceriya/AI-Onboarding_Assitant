module Api
  module V1
    class DocumentsController < BaseController
      def create
        document = current_user.documents.new(
          document_type: params[:document_type] || :id_card,
          status: :uploaded
        )
        document.file.attach(params[:file])

        if document.save
          EventBus.publish("document.uploaded", {
            user_id: current_user.id,
            document_id: document.id,
            document_type: document.document_type
          })

          # Process OCR synchronously for immediate feedback
          begin
            pipeline = DocumentProcessingPipeline.new
            result = pipeline.process(document)

            if result[:error]
              render json: { error: result[:error] }, status: :unprocessable_entity
              return
            end

            render json: {
              id: document.id,
              status: document.status,
              extracted_data: document.extracted_data,
              confidence_scores: document.confidence_scores,
              document_type: result[:document_type],
              overall_confidence: result[:overall_confidence],
              flags: result[:flags]
            }, status: :created
          rescue => e
            Rails.logger.error("OCR processing error: #{e.message}")
            render json: { error: "Failed to process document. Please try uploading again." }, status: :unprocessable_entity
          end
        else
          render json: { errors: document.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def show
        document = current_user.documents.find(params[:id])
        render json: {
          id: document.id,
          status: document.status,
          extracted_data: document.extracted_data,
          confidence_scores: document.confidence_scores
        }
      end

      def update
        document = current_user.documents.find(params[:id])
        document.update!(
          extracted_data: params[:extracted_data],
          status: :confirmed
        )

        EventBus.publish("document.confirmed", {
          user_id: current_user.id,
          document_id: document.id
        })

        current_user.update!(onboarding_step: :scheduling)
        UserMailer.document_verified(current_user, document).deliver_later
        render json: { id: document.id, status: document.status, extracted_data: document.extracted_data }
      end
    end
  end
end
