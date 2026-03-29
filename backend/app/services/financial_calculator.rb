class FinancialCalculator
  def monthly_payment(principal:, apr:, term_months:)
    return 0 if principal <= 0 || term_months <= 0
    return (principal / term_months.to_f).round(2) if apr <= 0

    monthly_rate = apr / 100.0 / 12.0
    numerator = principal * monthly_rate * (1 + monthly_rate)**term_months
    denominator = (1 + monthly_rate)**term_months - 1
    (numerator / denominator).round(2)
  end

  def total_cost(principal:, apr:, term_months:)
    payment = monthly_payment(principal: principal, apr: apr, term_months: term_months)
    (payment * term_months).round(2)
  end

  def total_interest(principal:, apr:, term_months:)
    (total_cost(principal: principal, apr: apr, term_months: term_months) - principal).round(2)
  end

  def what_if(base:, scenarios:)
    base_result = calculate_scenario(base)

    scenario_results = scenarios.map do |scenario|
      params = base.merge(scenario)
      result = calculate_scenario(params)
      {
        label: scenario[:label] || "Scenario",
        params: params.except(:label),
        monthly_payment: result[:monthly_payment],
        total_cost: result[:total_cost],
        total_interest: result[:total_interest],
        savings_vs_base: (base_result[:total_cost] - result[:total_cost]).round(2)
      }
    end

    {
      base: base_result,
      scenarios: scenario_results
    }
  end

  def amortization_schedule(principal:, apr:, term_months:, first_n: nil)
    payment = monthly_payment(principal: principal, apr: apr, term_months: term_months)
    monthly_rate = apr / 100.0 / 12.0
    balance = principal.to_f
    schedule = []

    limit = first_n || term_months

    (1..limit).each do |month|
      interest = (balance * monthly_rate).round(2)
      principal_paid = (payment - interest).round(2)
      balance = (balance - principal_paid).round(2)
      balance = 0 if balance < 0

      schedule << {
        month: month,
        payment: payment,
        principal: principal_paid,
        interest: interest,
        balance: balance
      }
    end

    schedule
  end

  private

  def calculate_scenario(params)
    p = params[:principal].to_f
    a = params[:apr].to_f
    t = params[:term_months].to_i

    {
      principal: p,
      apr: a,
      term_months: t,
      monthly_payment: monthly_payment(principal: p, apr: a, term_months: t),
      total_cost: total_cost(principal: p, apr: a, term_months: t),
      total_interest: total_interest(principal: p, apr: a, term_months: t)
    }
  end
end
