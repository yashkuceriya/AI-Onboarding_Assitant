class DocumentProcessingJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(document_id)
    document = Document.find(document_id)
    return if document.confirmed?

    pipeline = DocumentProcessingPipeline.new
    result = pipeline.process(document)

    if result[:error]
      Rails.logger.error("[DocumentProcessingJob] Document #{document_id}: #{result[:error]}")
    end
  end
end
