class VehicleRecommender
  SAMPLE_INVENTORY = [
    # Sedans
    { id: 1, make: "Toyota", model: "Camry LE", year: 2024, price: 28490, mpg: 32, safety_rating: 5, type: "sedan", color: "Pearl White", mileage: 8420, features: ["bluetooth", "backup_camera", "cruise_control", "apple_carplay"], image_gradient: ["#e8e8e8", "#c0c0c0"] },
    { id: 2, make: "Honda", model: "Civic Sport", year: 2025, price: 24890, mpg: 36, safety_rating: 5, type: "sedan", color: "Rallye Red", mileage: 2100, features: ["bluetooth", "backup_camera", "honda_sensing", "sunroof"], image_gradient: ["#cc2233", "#991a26"] },
    { id: 3, make: "Tesla", model: "Model 3", year: 2024, price: 37990, mpg: 132, safety_rating: 5, type: "sedan", color: "Midnight Silver", mileage: 3200, features: ["autopilot", "electric", "bluetooth", "fast_charging", "glass_roof"], image_gradient: ["#4a4a4a", "#2d2d2d"] },
    { id: 4, make: "BMW", model: "330i", year: 2023, price: 39800, mpg: 26, safety_rating: 5, type: "sedan", color: "Alpine White", mileage: 14200, features: ["leather", "navigation", "sunroof", "bluetooth", "parking_assist"], image_gradient: ["#f5f5f5", "#dcdcdc"] },
    { id: 5, make: "Hyundai", model: "Sonata SEL", year: 2024, price: 26950, mpg: 32, safety_rating: 5, type: "sedan", color: "Quartz White", mileage: 6800, features: ["bluetooth", "backup_camera", "wireless_charging", "blind_spot"], image_gradient: ["#e0e0e0", "#bfbfbf"] },
    { id: 6, make: "Mazda", model: "Mazda3 Turbo", year: 2024, price: 29500, mpg: 27, safety_rating: 5, type: "sedan", color: "Machine Gray", mileage: 5400, features: ["awd", "turbo", "bose_audio", "leather", "heads_up_display"], image_gradient: ["#6e6e6e", "#4d4d4d"] },
    { id: 7, make: "Mercedes-Benz", model: "C 300", year: 2023, price: 42500, mpg: 27, safety_rating: 5, type: "sedan", color: "Obsidian Black", mileage: 18700, features: ["leather", "navigation", "sunroof", "ambient_lighting", "burmester_audio"], image_gradient: ["#1f1f1f", "#0a0a0a"] },
    { id: 8, make: "Nissan", model: "Altima SR", year: 2024, price: 27200, mpg: 32, safety_rating: 5, type: "sedan", color: "Scarlet Ember", mileage: 9300, features: ["bluetooth", "backup_camera", "propilot", "heated_seats"], image_gradient: ["#8b2500", "#6b1c00"] },
    { id: 9, make: "Toyota", model: "Corolla Hybrid", year: 2025, price: 23400, mpg: 53, safety_rating: 5, type: "sedan", color: "Celestite Gray", mileage: 1200, features: ["hybrid", "bluetooth", "safety_sense", "apple_carplay", "android_auto"], image_gradient: ["#9ba8b5", "#7a8a98"] },
    { id: 10, make: "Kia", model: "K5 GT-Line", year: 2024, price: 28900, mpg: 32, safety_rating: 5, type: "sedan", color: "Wolf Gray", mileage: 7600, features: ["bluetooth", "backup_camera", "panoramic_sunroof", "wireless_charging"], image_gradient: ["#808080", "#5e5e5e"] },

    # SUVs & Crossovers
    { id: 11, make: "Honda", model: "CR-V EX-L", year: 2024, price: 33200, mpg: 30, safety_rating: 5, type: "suv", color: "Lunar Silver", mileage: 5100, features: ["awd", "bluetooth", "backup_camera", "lane_assist", "honda_sensing"], image_gradient: ["#b8c6d4", "#8fa8be"] },
    { id: 12, make: "Toyota", model: "RAV4 XLE", year: 2024, price: 31200, mpg: 30, safety_rating: 5, type: "suv", color: "Cavalry Blue", mileage: 7650, features: ["awd", "bluetooth", "backup_camera", "safety_sense", "roof_rails"], image_gradient: ["#5b7fa5", "#3d5f82"] },
    { id: 13, make: "Hyundai", model: "Tucson Limited", year: 2024, price: 34650, mpg: 29, safety_rating: 5, type: "suv", color: "Amazon Gray", mileage: 4200, features: ["awd", "bluetooth", "backup_camera", "wireless_charging", "heated_seats", "ventilated_seats"], image_gradient: ["#6b7b8d", "#4a5a6b"] },
    { id: 14, make: "Chevrolet", model: "Equinox RS", year: 2025, price: 29400, mpg: 31, safety_rating: 4, type: "suv", color: "Summit White", mileage: 1800, features: ["bluetooth", "backup_camera", "apple_carplay", "android_auto", "sport_appearance"], image_gradient: ["#f0f0f0", "#d4d4d4"] },
    { id: 15, make: "Mazda", model: "CX-5 Premium", year: 2024, price: 30500, mpg: 28, safety_rating: 5, type: "suv", color: "Soul Red Crystal", mileage: 9800, features: ["awd", "bluetooth", "bose_audio", "leather", "heated_seats"], image_gradient: ["#a11325", "#7a0e1c"] },
    { id: 16, make: "Kia", model: "Telluride SX", year: 2024, price: 43500, mpg: 23, safety_rating: 5, type: "suv", color: "Gravity Gray", mileage: 4500, features: ["awd", "3rd_row", "bluetooth", "leather", "heated_seats", "ventilated_seats", "heads_up_display"], image_gradient: ["#5c5c5c", "#3a3a3a"] },
    { id: 17, make: "Volkswagen", model: "ID.4 Pro S", year: 2024, price: 32500, mpg: 107, safety_rating: 5, type: "suv", color: "Dusk Blue", mileage: 6700, features: ["electric", "awd", "bluetooth", "fast_charging", "panoramic_roof"], image_gradient: ["#3b6d8f", "#2a5069"] },
    { id: 18, make: "Jeep", model: "Grand Cherokee Limited", year: 2023, price: 44200, mpg: 22, safety_rating: 4, type: "suv", color: "Diamond Black", mileage: 16800, features: ["4wd", "leather", "navigation", "towing", "air_suspension"], image_gradient: ["#1a1a1a", "#0d0d0d"] },
    { id: 19, make: "Ford", model: "Bronco Sport Big Bend", year: 2024, price: 31400, mpg: 26, safety_rating: 4, type: "suv", color: "Area 51 Blue", mileage: 8200, features: ["awd", "bluetooth", "backup_camera", "terrain_management", "roof_rails"], image_gradient: ["#6e8fa8", "#516d82"] },
    { id: 20, make: "Toyota", model: "Highlander XLE", year: 2024, price: 41800, mpg: 24, safety_rating: 5, type: "suv", color: "Celestial Silver", mileage: 3900, features: ["awd", "3rd_row", "leather", "sunroof", "jbl_audio", "safety_sense"], image_gradient: ["#c0c8d0", "#a0a8b0"] },
    { id: 21, make: "Subaru", model: "Forester Premium", year: 2024, price: 32100, mpg: 29, safety_rating: 5, type: "suv", color: "Jasper Green", mileage: 5400, features: ["awd", "bluetooth", "eyesight", "panoramic_sunroof", "heated_seats"], image_gradient: ["#4a6741", "#364d30"] },
    { id: 22, make: "Tesla", model: "Model Y", year: 2024, price: 44990, mpg: 123, safety_rating: 5, type: "suv", color: "Ultra White", mileage: 2800, features: ["electric", "autopilot", "glass_roof", "fast_charging", "premium_audio"], image_gradient: ["#fafafa", "#e0e0e0"] },
    { id: 23, make: "Lexus", model: "NX 350h", year: 2024, price: 42800, mpg: 39, safety_rating: 5, type: "suv", color: "Nori Green Pearl", mileage: 7100, features: ["hybrid", "awd", "leather", "mark_levinson_audio", "panoramic_roof", "heads_up_display"], image_gradient: ["#3d4a3a", "#2a332a"] },

    # Trucks
    { id: 24, make: "Ford", model: "F-150 XLT", year: 2023, price: 41750, mpg: 22, safety_rating: 4, type: "truck", color: "Velocity Blue", mileage: 18300, features: ["towing", "4wd", "bluetooth", "backup_camera", "bed_liner"], image_gradient: ["#2962a8", "#1a4478"] },
    { id: 25, make: "Toyota", model: "Tacoma TRD Sport", year: 2024, price: 38900, mpg: 24, safety_rating: 4, type: "truck", color: "Magnetic Gray", mileage: 9100, features: ["4wd", "bluetooth", "backup_camera", "towing", "crawl_control", "sport_suspension"], image_gradient: ["#7a7a7a", "#555555"] },
    { id: 26, make: "Chevrolet", model: "Silverado LT", year: 2024, price: 44500, mpg: 23, safety_rating: 4, type: "truck", color: "Northsky Blue", mileage: 6200, features: ["4wd", "towing", "bluetooth", "apple_carplay", "bed_liner", "trailering_package"], image_gradient: ["#4a6d8f", "#335070"] },
    { id: 27, make: "RAM", model: "1500 Big Horn", year: 2023, price: 42900, mpg: 22, safety_rating: 4, type: "truck", color: "Patriot Blue", mileage: 14500, features: ["4wd", "towing", "bluetooth", "uconnect", "bed_utility", "trailer_brake"], image_gradient: ["#1e3a5f", "#142842"] },
    { id: 28, make: "Ford", model: "Maverick XLT", year: 2024, price: 26800, mpg: 33, safety_rating: 4, type: "truck", color: "Alto Blue", mileage: 3800, features: ["hybrid", "bluetooth", "backup_camera", "apple_carplay", "bed_liner"], image_gradient: ["#5a7fa0", "#3d5f80"] },
    { id: 29, make: "Toyota", model: "Tundra SR5", year: 2024, price: 46200, mpg: 20, safety_rating: 4, type: "truck", color: "Smoked Mesquite", mileage: 8700, features: ["4wd", "towing", "bluetooth", "backup_camera", "i_force_max", "panoramic_roof"], image_gradient: ["#6b4c3b", "#4d362a"] },
    { id: 30, make: "GMC", model: "Sierra 1500 AT4", year: 2024, price: 52800, mpg: 21, safety_rating: 4, type: "truck", color: "Titanium Rush", mileage: 5200, features: ["4wd", "towing", "leather", "bose_audio", "multi_pro_tailgate", "off_road_package"], image_gradient: ["#8a7a6e", "#6b5c50"] },

    # Wagons & Hatchbacks
    { id: 31, make: "Subaru", model: "Outback Limited", year: 2024, price: 36400, mpg: 29, safety_rating: 5, type: "wagon", color: "Autumn Green", mileage: 6300, features: ["awd", "bluetooth", "eyesight", "roof_rails", "x_mode", "leather", "harman_kardon"], image_gradient: ["#4a6741", "#364d30"] },
    { id: 32, make: "Volkswagen", model: "Golf GTI", year: 2024, price: 31500, mpg: 29, safety_rating: 5, type: "wagon", color: "Kings Red", mileage: 4100, features: ["turbo", "bluetooth", "digital_cockpit", "sport_suspension", "heated_seats"], image_gradient: ["#b31b1b", "#8a1515"] },
    { id: 33, make: "Volvo", model: "V60 Cross Country", year: 2024, price: 47900, mpg: 28, safety_rating: 5, type: "wagon", color: "Thunder Gray", mileage: 8900, features: ["awd", "leather", "bowers_wilkins_audio", "panoramic_roof", "pilot_assist", "heated_steering"], image_gradient: ["#555e65", "#3d444a"] },
    { id: 34, make: "Audi", model: "A4 Allroad", year: 2024, price: 45600, mpg: 27, safety_rating: 5, type: "wagon", color: "Navarra Blue", mileage: 7200, features: ["awd", "leather", "virtual_cockpit", "bang_olufsen_audio", "panoramic_roof"], image_gradient: ["#2c4a6e", "#1e3450"] },
    { id: 35, make: "Toyota", model: "GR Corolla", year: 2024, price: 36300, mpg: 28, safety_rating: 4, type: "wagon", color: "Heavy Metal Gray", mileage: 3400, features: ["awd", "turbo", "6_speed_manual", "sport_exhaust", "torsen_diff"], image_gradient: ["#5a5a5a", "#3a3a3a"] },

    # Electric
    { id: 36, make: "Chevrolet", model: "Equinox EV", year: 2025, price: 33900, mpg: 115, safety_rating: 5, type: "suv", color: "Riptide Blue", mileage: 980, features: ["electric", "awd", "fast_charging", "super_cruise", "panoramic_roof"], image_gradient: ["#4a8fb8", "#2e6d90"] },
    { id: 37, make: "Hyundai", model: "Ioniq 5", year: 2024, price: 41500, mpg: 114, safety_rating: 5, type: "suv", color: "Digital Teal", mileage: 5600, features: ["electric", "awd", "fast_charging", "vehicle_to_load", "relaxation_seats", "heads_up_display"], image_gradient: ["#2a8a7a", "#1e6a5c"] },
    { id: 38, make: "Ford", model: "Mustang Mach-E", year: 2024, price: 39800, mpg: 100, safety_rating: 5, type: "suv", color: "Grabber Blue", mileage: 8100, features: ["electric", "awd", "fast_charging", "bang_olufsen_audio", "glass_roof"], image_gradient: ["#0077c8", "#005a98"] },
    { id: 39, make: "Rivian", model: "R1S", year: 2024, price: 54900, mpg: 95, safety_rating: 5, type: "suv", color: "Forest Green", mileage: 4200, features: ["electric", "awd", "3rd_row", "off_road", "camp_mode", "gear_tunnel"], image_gradient: ["#2d4a2d", "#1e331e"] },
    { id: 40, make: "Nissan", model: "Ariya Evolve+", year: 2024, price: 43800, mpg: 98, safety_rating: 5, type: "suv", color: "Aurora Green Pearl", mileage: 3100, features: ["electric", "awd", "propilot_2", "panoramic_roof", "bose_audio"], image_gradient: ["#3a6b55", "#284a3b"] }
  ].freeze

  def initialize
    @ai = AiService.new
  end

  def recommend(preferences)
    budget = preferences[:budget] || preferences["budget"] || 40000
    vehicle_type = preferences[:type] || preferences["type"]
    priorities = preferences[:priorities] || preferences["priorities"] || []
    min_mpg = preferences[:min_mpg] || preferences["min_mpg"]
    min_safety = preferences[:min_safety] || preferences["min_safety"]

    # Use real database vehicles instead of static sample
    db_vehicles = Vehicle.available.map do |v|
      {
        id: v.id, make: v.make, model: v.model, year: v.year, price: v.price.to_f,
        mpg: v.mpg.to_i, safety_rating: v.safety_rating.to_f, type: v.body_type,
        color: v.color, mileage: v.mileage.to_i,
        features: v.features || [],
        image_gradient: v.image_gradient || ["#64748b", "#475569"],
        image_url: v.image_url
      }
    end

    inventory = db_vehicles.any? ? db_vehicles : SAMPLE_INVENTORY

    scored = inventory.map do |vehicle|
      score = 0.0
      reasons = []

      if vehicle[:price] <= budget.to_f
        budget_ratio = 1.0 - (vehicle[:price] / budget.to_f)
        score += 30 * [budget_ratio + 0.5, 1.0].min
        reasons << "Within budget" if vehicle[:price] <= budget.to_f * 0.9
        reasons << "Great value" if vehicle[:price] <= budget.to_f * 0.7
      end

      if vehicle_type && vehicle[:type] == vehicle_type.to_s.downcase
        score += 25
        reasons << "#{vehicle[:type].capitalize} match"
      end

      if priorities.map(&:to_s).include?("fuel_efficiency") || min_mpg
        mpg_score = [vehicle[:mpg].to_f / 40.0, 1.0].min * 20
        score += mpg_score
        reasons << "#{vehicle[:mpg]} MPG" if vehicle[:mpg].to_i >= 30
      end

      if priorities.map(&:to_s).include?("safety") || min_safety
        safety_score = (vehicle[:safety_rating].to_f / 5.0) * 15
        score += safety_score
        reasons << "5-star safety" if vehicle[:safety_rating].to_i >= 5
      end

      desired_features = (preferences[:features] || preferences["features"] || []).map(&:to_s)
      if desired_features.any?
        vf = vehicle[:features].is_a?(Array) ? vehicle[:features].map(&:to_s) : []
        matches = (desired_features & vf).length
        feature_score = (matches.to_f / desired_features.length) * 10
        score += feature_score
        reasons << "#{matches}/#{desired_features.length} features" if matches > 0
      end

      vehicle.merge(match_score: score.round(1), match_reasons: reasons)
    end

    within_budget = scored.select { |v| v[:price] <= budget.to_f }
    results = within_budget.any? ? within_budget : scored

    results.sort_by { |v| -v[:match_score] }.first(5)
  end

  def conversational_recommend(user_message, user)
    system = <<~PROMPT
      You are a car recommendation assistant. Based on the user's message, extract
      their vehicle preferences. Be conversational and helpful.

      Respond with a brief recommendation (2-3 sentences) followed by:
      PREFERENCES: {"budget": 30000, "type": "suv", "priorities": ["safety", "fuel_efficiency"]}

      Only include fields you can infer. Set null for unknown fields.
    PROMPT

    result = @ai.chat(
      messages: [{ role: "user", content: user_message }],
      system: system,
      model: :fast,
      max_tokens: 256
    )

    content = result.content
    prefs_match = content.match(/PREFERENCES:\s*(\{.*\})/m)

    if prefs_match
      prefs = JSON.parse(prefs_match[1])
      recommendations = recommend(prefs)
      clean_content = content.sub(/\nPREFERENCES:.*$/m, "").strip
      { message: clean_content, recommendations: recommendations, preferences: prefs }
    else
      { message: content, recommendations: [], preferences: {} }
    end
  rescue JSON::ParserError
    { message: result&.content || "I'd love to help you find the right car!", recommendations: [], preferences: {} }
  end
end
