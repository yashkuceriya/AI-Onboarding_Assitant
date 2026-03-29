module Api
  module V1
    class FinancialController < BaseController
      def explain
        calculator = FinancialCalculator.new
        principal = params[:principal].to_f
        apr = params[:apr].to_f
        term_months = params[:term_months].to_i

        if principal <= 0 || term_months <= 0
          render json: { error: "Principal and term must be positive" }, status: :unprocessable_entity
          return
        end

        calculation = {
          monthly_payment: calculator.monthly_payment(principal: principal, apr: apr, term_months: term_months),
          total_cost: calculator.total_cost(principal: principal, apr: apr, term_months: term_months),
          total_interest: calculator.total_interest(principal: principal, apr: apr, term_months: term_months),
          schedule_preview: calculator.amortization_schedule(principal: principal, apr: apr, term_months: term_months, first_n: 3)
        }

        # Generate plain-language explanation via LLM
        explanation = generate_explanation(principal, apr, term_months, calculation)

        render json: {
          calculation: calculation,
          explanation: explanation
        }
      end

      def what_if
        calculator = FinancialCalculator.new

        base = {
          principal: params[:principal].to_f,
          apr: params[:apr].to_f,
          term_months: params[:term_months].to_i
        }

        scenarios = (params[:scenarios] || []).map do |s|
          s.permit(:label, :principal, :apr, :term_months).to_h.symbolize_keys
        end

        if scenarios.empty?
          # Generate default comparison scenarios
          scenarios = default_scenarios(base)
        end

        result = calculator.what_if(base: base, scenarios: scenarios)

        render json: result
      end

      private

      def generate_explanation(principal, apr, term_months, calculation)
        ai = AiService.new
        prompt = <<~PROMPT
          Explain this car loan in plain, friendly language (2-3 sentences max):
          - Vehicle price: $#{format('%.2f', principal)}
          - APR: #{apr}%
          - Loan term: #{term_months} months
          - Monthly payment: $#{format('%.2f', calculation[:monthly_payment])}
          - Total cost: $#{format('%.2f', calculation[:total_cost])}
          - Total interest: $#{format('%.2f', calculation[:total_interest])}

          Use concrete examples like "for every $10,000 borrowed at this rate..." or comparisons to everyday costs.
          Do NOT use jargon. Make it feel like a knowledgeable friend explaining it.
        PROMPT

        result = ai.chat(
          messages: [{ role: "user", content: prompt }],
          system: "You are a friendly financial explainer for car buyers. Be concise, clear, and reassuring. Never give financial advice — just explain the numbers.",
          model: :fast,
          max_tokens: 256,
          temperature: 0.7
        )

        result.content
      rescue => e
        Rails.logger.error("[FinancialController] LLM explanation failed: #{e.message}")
        "Your monthly payment would be $#{format('%.2f', calculation[:monthly_payment])} for #{term_months} months, " \
        "totaling $#{format('%.2f', calculation[:total_cost])} (including $#{format('%.2f', calculation[:total_interest])} in interest)."
      end

      def default_scenarios(base)
        [
          { label: "Shorter term (36 months)", principal: base[:principal], apr: base[:apr], term_months: 36 },
          { label: "Longer term (72 months)", principal: base[:principal], apr: base[:apr], term_months: 72 },
          { label: "$2,000 more down payment", principal: [base[:principal] - 2000, 0].max, apr: base[:apr], term_months: base[:term_months] }
        ]
      end
    end
  end
end
