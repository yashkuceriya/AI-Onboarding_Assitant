class Achievement < ApplicationRecord
  belongs_to :user

  validates :achievement_type, uniqueness: { scope: :user_id }

  TYPES = {
    first_login: { title: "Welcome Aboard!", description: "Signed up and started your journey" },
    profile_complete: { title: "Profile Pro", description: "Completed your profile assessment" },
    first_document: { title: "Paper Trail", description: "Uploaded your first document" },
    all_documents: { title: "Fully Documented", description: "All documents verified and confirmed" },
    appointment_booked: { title: "Calendar King", description: "Booked your first appointment" },
    speed_demon: { title: "Speed Demon", description: "Completed onboarding in under 10 minutes" },
    checklist_hero: { title: "Checklist Hero", description: "Completed all checklist items" },
    chat_explorer: { title: "Curious Mind", description: "Asked 10+ questions to the AI assistant" },
    onboarding_complete: { title: "All Set!", description: "Completed the entire onboarding process" }
  }.freeze
end
