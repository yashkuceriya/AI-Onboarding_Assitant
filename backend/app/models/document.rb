class Document < ApplicationRecord
  belongs_to :user
  has_one_attached :file

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
