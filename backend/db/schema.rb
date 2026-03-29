# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_03_27_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "vector"

  create_table "achievements", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "achievement_type", null: false
    t.string "title", null: false
    t.text "description"
    t.datetime "unlocked_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "achievement_type"], name: "index_achievements_on_user_id_and_achievement_type", unique: true
    t.index ["user_id"], name: "index_achievements_on_user_id"
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "affirmations", force: :cascade do |t|
    t.text "content"
    t.string "category"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "appointments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.date "scheduled_date"
    t.time "scheduled_time"
    t.integer "status", default: 0
    t.boolean "reminder_sent", default: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_appointments_on_user_id"
  end

  create_table "available_slots", force: :cascade do |t|
    t.date "date"
    t.time "time"
    t.boolean "is_booked", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["date", "time"], name: "index_available_slots_on_date_and_time", unique: true
  end

  create_table "checklist_items", force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.integer "position", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "conversations", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.integer "status", default: 0
    t.jsonb "summary", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_conversations_on_user_id"
  end

  create_table "deliveries", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "vehicle_id", null: false
    t.integer "status", default: 0, null: false
    t.string "tracking_number"
    t.date "estimated_delivery_date"
    t.date "actual_delivery_date"
    t.string "delivery_address"
    t.string "driver_name"
    t.string "driver_phone"
    t.jsonb "timeline", default: []
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_deliveries_on_status"
    t.index ["tracking_number"], name: "index_deliveries_on_tracking_number", unique: true
    t.index ["user_id"], name: "index_deliveries_on_user_id"
    t.index ["vehicle_id"], name: "index_deliveries_on_vehicle_id"
  end

  create_table "documents", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.integer "document_type"
    t.jsonb "extracted_data", default: {}
    t.jsonb "confidence_scores", default: {}
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_documents_on_user_id"
  end

  create_table "embeddings", force: :cascade do |t|
    t.text "content", null: false
    t.vector "embedding", limit: 1536
    t.string "source", null: false
    t.string "source_type"
    t.jsonb "metadata", default: {}
    t.integer "token_count"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["source"], name: "index_embeddings_on_source"
    t.index ["source_type"], name: "index_embeddings_on_source_type"
  end

  create_table "favorites", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "vehicle_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "vehicle_id"], name: "index_favorites_on_user_id_and_vehicle_id", unique: true
    t.index ["user_id"], name: "index_favorites_on_user_id"
    t.index ["vehicle_id"], name: "index_favorites_on_vehicle_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "conversation_id", null: false
    t.integer "role"
    t.text "content"
    t.jsonb "quick_replies"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "sentiment"
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.text "body"
    t.string "notification_type", null: false
    t.string "icon"
    t.string "action_url"
    t.boolean "read", default: false
    t.datetime "read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_notifications_on_created_at"
    t.index ["user_id", "read"], name: "index_notifications_on_user_id_and_read"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "onboarding_items", force: :cascade do |t|
    t.bigint "onboarding_step_id", null: false
    t.string "title", null: false
    t.text "description"
    t.string "emoji"
    t.integer "position", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["onboarding_step_id"], name: "index_onboarding_items_on_onboarding_step_id"
  end

  create_table "onboarding_steps", force: :cascade do |t|
    t.string "title", null: false
    t.string "color", null: false
    t.integer "position", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "sell_offers", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "make", null: false
    t.string "model", null: false
    t.integer "year", null: false
    t.integer "mileage", null: false
    t.string "condition", default: "good", null: false
    t.string "vin"
    t.string "color"
    t.string "trim"
    t.text "description"
    t.decimal "offer_amount", precision: 10, scale: 2
    t.decimal "range_low", precision: 10, scale: 2
    t.decimal "range_high", precision: 10, scale: 2
    t.jsonb "offer_breakdown", default: {}
    t.integer "status", default: 0, null: false
    t.date "pickup_date"
    t.string "pickup_address"
    t.string "pickup_time_slot"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_sell_offers_on_status"
    t.index ["user_id", "status"], name: "index_sell_offers_on_user_id_and_status"
    t.index ["user_id"], name: "index_sell_offers_on_user_id"
  end

  create_table "user_checklist_items", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "checklist_item_id", null: false
    t.boolean "completed", default: false
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_item_id"], name: "index_user_checklist_items_on_checklist_item_id"
    t.index ["user_id", "checklist_item_id"], name: "index_user_checklist_items_on_user_id_and_checklist_item_id", unique: true
    t.index ["user_id"], name: "index_user_checklist_items_on_user_id"
  end

  create_table "user_events", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "event_type", null: false
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_user_events_on_created_at"
    t.index ["event_type"], name: "index_user_events_on_event_type"
    t.index ["user_id"], name: "index_user_events_on_user_id"
  end

  create_table "user_onboarding_progresses", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "onboarding_step_id", null: false
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["onboarding_step_id"], name: "index_user_onboarding_progresses_on_onboarding_step_id"
    t.index ["user_id", "onboarding_step_id"], name: "idx_user_onboarding_progress", unique: true
    t.index ["user_id"], name: "index_user_onboarding_progresses_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone"
    t.string "preferred_contact"
    t.integer "priority_level", default: 0
    t.jsonb "profile_data", default: {}
    t.integer "onboarding_step", default: 0
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "session_data", default: {}
    t.string "password_reset_token"
    t.datetime "password_reset_sent_at"
  end

  create_table "vehicles", force: :cascade do |t|
    t.string "make", null: false
    t.string "model", null: false
    t.integer "year", null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.integer "mileage", default: 0, null: false
    t.string "body_type", null: false
    t.string "color", null: false
    t.string "exterior_color"
    t.integer "mpg"
    t.decimal "safety_rating", precision: 2, scale: 1
    t.text "description"
    t.string "vin"
    t.string "engine"
    t.string "transmission", default: "Automatic"
    t.string "drivetrain"
    t.jsonb "features", default: []
    t.jsonb "image_gradient", default: ["#cccccc", "#999999"]
    t.boolean "available", default: true
    t.string "location"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "image_url"
    t.index ["available"], name: "index_vehicles_on_available"
    t.index ["body_type"], name: "index_vehicles_on_body_type"
    t.index ["make", "model"], name: "index_vehicles_on_make_and_model"
    t.index ["price"], name: "index_vehicles_on_price"
    t.index ["year"], name: "index_vehicles_on_year"
  end

  add_foreign_key "achievements", "users"
  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "appointments", "users"
  add_foreign_key "conversations", "users"
  add_foreign_key "deliveries", "users"
  add_foreign_key "deliveries", "vehicles"
  add_foreign_key "documents", "users"
  add_foreign_key "favorites", "users"
  add_foreign_key "favorites", "vehicles"
  add_foreign_key "messages", "conversations"
  add_foreign_key "notifications", "users"
  add_foreign_key "onboarding_items", "onboarding_steps"
  add_foreign_key "sell_offers", "users"
  add_foreign_key "user_checklist_items", "checklist_items"
  add_foreign_key "user_checklist_items", "users"
  add_foreign_key "user_events", "users"
  add_foreign_key "user_onboarding_progresses", "onboarding_steps"
  add_foreign_key "user_onboarding_progresses", "users"
end
