class RagService
  CHUNK_SIZE = 400
  CHUNK_OVERLAP = 50
  TOP_K = 5

  def initialize
    @ai = AiService.new
  end

  def ingest(content:, source:, source_type: "faq")
    chunks = chunk_text(content)

    chunks.each do |chunk|
      embedding_vector = @ai.embed(text: chunk)
      next unless embedding_vector

      Embedding.create!(
        content: chunk,
        embedding: embedding_vector,
        source: source,
        source_type: source_type,
        token_count: estimate_tokens(chunk)
      )
    end
  end

  def search(query, top_k: TOP_K)
    query_embedding = @ai.embed(text: query)
    return [] unless query_embedding

    Embedding.nearest_neighbors(:embedding, query_embedding, distance: "cosine").limit(top_k)
  end

  def augmented_prompt(query, system_prompt: nil)
    results = search(query)
    return { context: "", chunks: [] } if results.empty?

    context = results.map.with_index do |r, i|
      "[#{i + 1}] (source: #{r.source})\n#{r.content}"
    end.join("\n\n")

    augmented_system = <<~PROMPT
      #{system_prompt}

      Use the following reference information to help answer the user's question.
      If the information doesn't contain the answer, say so honestly.
      Always cite which source you're drawing from.

      === REFERENCE INFORMATION ===
      #{context}
      === END REFERENCE ===
    PROMPT

    { context: augmented_system, chunks: results.map { |r| { content: r.content, source: r.source } } }
  end

  def seed_faq_content
    faq_entries = [
      { source: "financing_terms", content: <<~FAQ },
        Carvana Financing FAQ:
        - APR rates range from 3.9% to 27.9% depending on credit score and term length.
        - Loan terms available: 36, 48, 60, and 72 months.
        - No prepayment penalties on any Carvana loan.
        - Down payments can be as low as $0 for qualified buyers.
        - Co-signers are accepted and can help improve loan terms.
        - GAP coverage is available as an add-on during financing.
        - Monthly payments include principal, interest, and any add-on products.
        - You can refinance your Carvana loan through any bank or credit union.
      FAQ
      { source: "delivery_process", content: <<~FAQ },
        Carvana Delivery Process:
        - Free delivery available within your market area.
        - Delivery typically takes 3-7 business days after purchase completion.
        - You can track your delivery status in real-time through your account.
        - A Carvana advocate will contact you to schedule your delivery window.
        - Delivery windows are typically 2-hour blocks.
        - You can pick up from a Carvana vending machine instead of home delivery.
        - All vehicles come with a 150-point inspection report.
      FAQ
      { source: "return_policy", content: <<~FAQ },
        Carvana 7-Day Money-Back Guarantee:
        - You have 7 days from delivery to return your vehicle for any reason.
        - Returns are completely free with no restocking fees.
        - Mileage limit of 400 miles during the return period.
        - Refund is processed within 3-5 business days of vehicle pickup.
        - If you financed through Carvana, the loan is fully cancelled.
        - The 7-day period starts the day after delivery.
        - You can exchange for a different vehicle instead of returning.
      FAQ
      { source: "document_requirements", content: <<~FAQ },
        Required Documents for Carvana Purchase:
        - Valid driver's license (not expired, matches state of registration).
        - Proof of insurance (must be active before delivery).
        - Proof of income if financing (recent pay stubs or bank statements).
        - Proof of residence (utility bill or bank statement within 60 days).
        - Trade-in title if applicable (must be in your name, no liens).
        - Registration will be handled by Carvana in your state.
        - Temporary tags are provided at delivery; permanent plates arrive by mail.
      FAQ
      { source: "registration_requirements", content: <<~FAQ }
        State Registration Requirements:
        - Carvana handles all registration and title transfer paperwork.
        - Sales tax varies by state (0% to 10%+).
        - Some states require emissions testing before registration.
        - California, Colorado, and a few other states have additional fees.
        - Registration fees are included in your total out-the-door price.
        - Temporary tags are valid for 30-90 days depending on state.
        - If registration is delayed, Carvana will extend your temporary tag.
      FAQ
    ]

    faq_entries.each do |entry|
      ingest(content: entry[:content], source: entry[:source], source_type: "faq")
    end
  end

  private

  def chunk_text(text)
    words = text.split(/\s+/)
    chunks = []
    start = 0

    while start < words.length
      chunk_end = [start + CHUNK_SIZE, words.length].min
      chunks << words[start...chunk_end].join(" ")
      start += CHUNK_SIZE - CHUNK_OVERLAP
    end

    chunks
  end

  def estimate_tokens(text)
    (text.length / 4.0).ceil
  end
end
