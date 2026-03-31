class Document < ApplicationRecord
  belongs_to :user
  has_one_attached :file

  validate :acceptable_file

  private

  def acceptable_file
    return unless file.attached?

    unless file.content_type.in?(%w[image/jpeg image/png image/webp application/pdf])
      errors.add(:file, "must be JPEG, PNG, WebP, or PDF")
    end

    if file.byte_size > 10.megabytes
      errors.add(:file, "must be under 10 MB")
    end
  end

  enum :document_type, {
    id_card: 0,
    form: 1,
    other: 2,
    drivers_license: 3,
    insurance_card: 4,
    pay_stub: 5,
    bank_statement: 6,
    registration: 7,
    title: 8
  }

  enum :status, { uploaded: 0, processing: 1, reviewed: 2, confirmed: 3 }
end
