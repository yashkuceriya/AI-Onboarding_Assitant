# Clear old data
Affirmation.delete_all

# Emotional support content — designed to reduce stress and anxiety during onboarding
affirmations = [
  # Encouragement
  { content: "You're doing great. Every step you take is a step closer to a decision you'll feel good about.", category: "encouragement" },
  { content: "There's no rush here. Take the time you need — we'll be here whenever you're ready.", category: "encouragement" },
  { content: "It's completely normal to feel overwhelmed. Big decisions are hard, and you're handling it well.", category: "encouragement" },
  { content: "You've already made it this far. That takes real courage.", category: "encouragement" },
  # Validation
  { content: "Whatever questions you have, they're good questions. There are no wrong ones.", category: "validation" },
  { content: "It's okay to not know everything right now. That's exactly what this process is for.", category: "validation" },
  { content: "Feeling unsure is a sign you're being thoughtful, not a sign you're doing it wrong.", category: "validation" },
  { content: "Your concerns matter. Every one of them.", category: "validation" },
  # Reassurance
  { content: "You can change your mind at any point. No penalties, no judgment.", category: "reassurance" },
  { content: "Your information is safe with us. We take your privacy seriously.", category: "reassurance" },
  { content: "There's a 7-day money-back guarantee. This is a try-before-you-commit experience.", category: "reassurance" },
  { content: "Every vehicle has been inspected 150 points. You can feel confident in the quality.", category: "reassurance" },
  # Self-care
  { content: "Take a deep breath. You're in control of this process, not the other way around.", category: "self-care" },
  { content: "If you need a break, close the tab and come back later. Your progress is saved.", category: "self-care" },
  { content: "Remember: this should feel good. If something doesn't feel right, it's okay to pause.", category: "self-care" }
]

affirmations.each do |attrs|
  Affirmation.find_or_create_by!(content: attrs[:content]) do |a|
    a.category = attrs[:category]
    a.active = true
  end
end

puts "Created #{Affirmation.count} affirmations"

# Available appointment slots (next 2 weeks)
start_date = Date.today + 1
end_date = start_date + 14

(start_date..end_date).each do |date|
  next if date.saturday? || date.sunday?

  times = %w[09:00 09:30 10:00 10:30 11:00 11:30 13:00 13:30 14:00 14:30 15:00 15:30 16:00]

  times.each do |time|
    AvailableSlot.find_or_create_by!(date: date, time: time) do |slot|
      slot.is_booked = rand < 0.2
    end
  end
end

puts "Created #{AvailableSlot.count} appointment slots (#{AvailableSlot.open.count} available)"

# Onboarding Steps — Car Purchase Journey
steps_data = [
  {
    title: "Get Pre-Qualified",
    color: "blue",
    position: 1,
    items: [
      { title: "Tell us about yourself", emoji: "wave", position: 1 },
      { title: "Share your vehicle preferences", emoji: "car", position: 2 },
      { title: "Review financing options", emoji: "chart", position: 3 },
      { title: "Get your pre-qualification estimate", emoji: "target", position: 4 }
    ]
  },
  {
    title: "Verify Your Identity",
    color: "yellow",
    position: 2,
    items: [
      { title: "Upload your driver's license", emoji: "clipboard", position: 1 },
      { title: "Provide proof of insurance", emoji: "lock", position: 2 },
      { title: "Submit proof of income (if financing)", emoji: "chart", position: 3 },
      { title: "Review and confirm extracted info", emoji: "target", position: 4 }
    ]
  },
  {
    title: "Choose & Schedule",
    color: "green",
    position: 3,
    items: [
      { title: "Browse AI-recommended vehicles", emoji: "car", position: 1 },
      { title: "Review vehicle history & inspection", emoji: "clipboard", position: 2 },
      { title: "Select delivery date and time", emoji: "calendar", position: 3 },
      { title: "Confirm your delivery address", emoji: "sitemap", position: 4 }
    ]
  },
  {
    title: "Complete Purchase",
    color: "purple",
    position: 4,
    items: [
      { title: "Review final pricing and terms", emoji: "chart", position: 1 },
      { title: "Sign purchase agreement digitally", emoji: "certificate", position: 2 },
      { title: "Set up payment or financing", emoji: "lock", position: 3 },
      { title: "Get delivery confirmation", emoji: "handshake", position: 4 }
    ]
  }
]

# Clear old steps and recreate
UserOnboardingProgress.delete_all
OnboardingItem.delete_all
OnboardingStep.delete_all

steps_data.each do |step_data|
  items = step_data.delete(:items)
  step = OnboardingStep.create!(
    title: step_data[:title],
    color: step_data[:color],
    position: step_data[:position]
  )
  items.each do |item_data|
    step.onboarding_items.create!(
      title: item_data[:title],
      emoji: item_data[:emoji],
      position: item_data[:position]
    )
  end
end

puts "Created #{OnboardingStep.count} onboarding steps with #{OnboardingItem.count} items"

# Checklist Items — Car Purchase Checklist
UserChecklistItem.delete_all
ChecklistItem.delete_all

checklist_data = [
  { title: "Complete pre-qualification chat", position: 1 },
  { title: "Review vehicle matches", position: 2 },
  { title: "Upload driver's license", position: 3 },
  { title: "Provide proof of insurance", position: 4 },
  { title: "Review financing terms & APR", position: 5 },
  { title: "Schedule delivery date", position: 6 },
  { title: "Confirm delivery address", position: 7 },
  { title: "Review 7-day return policy", position: 8 }
]

checklist_data.each do |attrs|
  ChecklistItem.create!(title: attrs[:title], position: attrs[:position])
end

puts "Created #{ChecklistItem.count} checklist items"

# Vehicle Inventory
Favorite.delete_all
Vehicle.delete_all

vehicles_data = [
  { make: "Toyota", model: "RAV4 XLE", year: 2024, price: 31200, mileage: 7650, body_type: "SUV", color: "Cavalry Blue", exterior_color: "Blue", mpg: 30, safety_rating: 4.8, engine: "2.5L 4-Cylinder", drivetrain: "AWD", vin: "2T3P1RFV8RW#{rand(100000..999999)}", location: "Phoenix, AZ", image_gradient: ["#5b7fa5", "#3d5f82"], features: ["Apple CarPlay", "Blind Spot Monitor", "Lane Departure Alert", "Adaptive Cruise Control", "Sunroof", "Heated Seats"], description: "One-owner RAV4 with Toyota Safety Sense suite. Perfect blend of comfort, capability, and efficiency.", image_url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80" },
  { make: "Honda", model: "Civic Sport", year: 2025, price: 24890, mileage: 2100, body_type: "Sedan", color: "Rallye Red", exterior_color: "Red", mpg: 36, safety_rating: 4.9, engine: "2.0L 4-Cylinder", drivetrain: "FWD", vin: "19XFL1H7#{rand(10..99)}E#{rand(100000..999999)}", location: "Dallas, TX", image_gradient: ["#cc2233", "#991a26"], features: ["Honda Sensing", "Apple CarPlay", "Android Auto", "Sport Mode", "18\" Alloy Wheels", "LED Headlights"], description: "Nearly new Civic Sport with aggressive styling and Honda's legendary reliability.", image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80" },
  { make: "Tesla", model: "Model 3 Long Range", year: 2024, price: 37990, mileage: 3200, body_type: "Sedan", color: "Midnight Silver", exterior_color: "Silver", mpg: 132, safety_rating: 5.0, engine: "Dual Motor Electric", drivetrain: "AWD", vin: "5YJ3E1EA#{rand(10..99)}F#{rand(100000..999999)}", location: "Los Angeles, CA", image_gradient: ["#4a4a4a", "#2d2d2d"], features: ["Autopilot", "15\" Touchscreen", "Glass Roof", "Premium Audio", "Heated Seats", "Sentry Mode", "Supercharger Network"], description: "Long Range Model 3 with 358-mile range. Full Self-Driving capable.", image_url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80" },
  { make: "Kia", model: "Telluride SX", year: 2024, price: 43500, mileage: 4500, body_type: "SUV", color: "Gravity Gray", exterior_color: "Gray", mpg: 23, safety_rating: 4.7, engine: "3.8L V6", drivetrain: "AWD", vin: "5XYP5DHC#{rand(10..99)}G#{rand(100000..999999)}", location: "Atlanta, GA", image_gradient: ["#5c5c5c", "#3a3a3a"], features: ["3rd Row Seating", "Nappa Leather", "Heads-Up Display", "Surround View Monitor", "Harman Kardon Audio", "Captain's Chairs"], description: "Award-winning 3-row SUV. Perfect for families who want premium features without the luxury price tag.", image_url: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80" },
  { make: "Mazda", model: "CX-5 Carbon Edition", year: 2024, price: 30500, mileage: 9800, body_type: "SUV", color: "Soul Red Crystal", exterior_color: "Red", mpg: 28, safety_rating: 4.6, engine: "2.5L Turbo 4-Cylinder", drivetrain: "AWD", vin: "JM3KF4C7#{rand(10..99)}#{rand(1000000..9999999)}", location: "Seattle, WA", image_gradient: ["#a11325", "#7a0e1c"], features: ["Bose Audio", "Leather Seats", "Power Liftgate", "Wireless Charging", "Heated Steering Wheel", "360 Camera"], description: "Turbo-powered CX-5 with premium Nappa leather and Mazda's signature driving dynamics.", image_url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80" },
  { make: "Ford", model: "Maverick XLT Hybrid", year: 2024, price: 26800, mileage: 3800, body_type: "Truck", color: "Alto Blue", exterior_color: "Blue", mpg: 42, safety_rating: 4.5, engine: "2.5L Hybrid", drivetrain: "FWD", vin: "3FTTW8E3#{rand(10..99)}R#{rand(100000..999999)}", location: "Denver, CO", image_gradient: ["#5a7fa0", "#3d5f80"], features: ["SYNC 3", "Co-Pilot360", "FordPass Connect", "Bed Utility Package", "Trailer Hitch", "Apple CarPlay"], description: "The truck that gets 42 MPG city. Versatile, efficient, and surprisingly fun to drive.", image_url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80" },
  { make: "Hyundai", model: "Ioniq 5 Limited", year: 2024, price: 41500, mileage: 5600, body_type: "SUV", color: "Digital Teal", exterior_color: "Teal", mpg: 114, safety_rating: 4.8, engine: "Dual Motor Electric", drivetrain: "AWD", vin: "KM8KNDAL#{rand(10..99)}U#{rand(100000..999999)}", location: "Portland, OR", image_gradient: ["#2a8a7a", "#1e6a5c"], features: ["Vehicle-to-Load", "Augmented Reality HUD", "Relaxation Seats", "BOSE Premium Audio", "Ultra-Fast Charging", "Digital Side Mirrors"], description: "Award-winning electric crossover with 800V ultra-fast charging. 0-80% in just 18 minutes.", image_url: "https://images.unsplash.com/photo-1680024315041-764e1850a69d?auto=format&fit=crop&w=800&q=80" },
  { make: "Subaru", model: "Outback Limited", year: 2024, price: 36400, mileage: 6300, body_type: "Wagon", color: "Autumn Green", exterior_color: "Green", mpg: 29, safety_rating: 4.7, engine: "2.5L Boxer 4-Cylinder", drivetrain: "AWD", vin: "4S4BTAPC#{rand(10..99)}#{rand(1000000..9999999)}", location: "Boulder, CO", image_gradient: ["#4a6741", "#364d30"], features: ["EyeSight Driver Assist", "Starlink", "Power Rear Gate", "Leather Seats", "Roof Rails", "X-Mode"], description: "Go-anywhere wagon with standard AWD and Subaru's legendary EyeSight safety system.", image_url: "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?auto=format&fit=crop&w=800&q=80" },
  { make: "BMW", model: "330i xDrive", year: 2023, price: 39800, mileage: 14200, body_type: "Sedan", color: "Alpine White", exterior_color: "White", mpg: 30, safety_rating: 4.6, engine: "2.0L TwinPower Turbo", drivetrain: "AWD", vin: "WBA5R7C0#{rand(10..99)}#{rand(1000000..9999999)}", location: "Chicago, IL", image_gradient: ["#e8e8e8", "#cccccc"], features: ["M Sport Package", "Live Cockpit Pro", "Harman Kardon Audio", "Heated Seats", "Parking Assistant", "Wireless Charging"], description: "The ultimate driving machine. M Sport package with dynamic handling and turbocharged performance.", image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80" },
  { make: "Chevrolet", model: "Bolt EUV Premier", year: 2024, price: 28900, mileage: 8400, body_type: "SUV", color: "Ice Blue", exterior_color: "Blue", mpg: 115, safety_rating: 4.5, engine: "Electric Motor", drivetrain: "FWD", vin: "1G1FY6S0#{rand(10..99)}#{rand(1000000..9999999)}", location: "Nashville, TN", image_gradient: ["#7ab0d4", "#5a90b4"], features: ["Super Cruise", "Bose Audio", "Surround Vision", "Wireless Charging", "Heated Seats", "DC Fast Charging"], description: "Affordable electric with GM's hands-free Super Cruise highway driving. 247-mile range.", image_url: "https://images.unsplash.com/photo-1651608790173-f3819e3ba43a?auto=format&fit=crop&w=800&q=80" },
  { make: "Toyota", model: "Camry SE", year: 2025, price: 28500, mileage: 1200, body_type: "Sedan", color: "Midnight Black", exterior_color: "Black", mpg: 32, safety_rating: 4.8, engine: "2.5L Dynamic Force", drivetrain: "FWD", vin: "4T1G11AK#{rand(10..99)}U#{rand(100000..999999)}", location: "Houston, TX", image_gradient: ["#2a2a2a", "#111111"], features: ["Toyota Safety Sense 3.0", "9\" Touchscreen", "Wireless CarPlay", "Dynamic Radar Cruise", "Sport-Tuned Suspension", "Dual Exhaust"], description: "All-new 2025 Camry with bold design and Toyota's latest safety tech. America's best-selling sedan.", image_url: "https://images.unsplash.com/photo-1621993202323-eb4e81f5a0a7?auto=format&fit=crop&w=800&q=80" },
  { make: "Jeep", model: "Wrangler Sahara", year: 2024, price: 45200, mileage: 11000, body_type: "SUV", color: "Hydro Blue", exterior_color: "Blue", mpg: 22, safety_rating: 4.3, engine: "3.6L Pentastar V6", drivetrain: "4WD", vin: "1C4HJXEN#{rand(10..99)}W#{rand(100000..999999)}", location: "Moab, UT", image_gradient: ["#3d8bbd", "#2a6a9a"], features: ["Removable Top", "Trail Rated", "Uconnect 5", "Alpine Audio", "LED Lighting", "Rock Rails", "Dana 44 Axles"], description: "Iconic Wrangler Sahara with go-anywhere capability. Removable top and doors for open-air fun.", image_url: "https://images.unsplash.com/photo-1533591380348-14193f1de18f?auto=format&fit=crop&w=800&q=80" },
  { make: "Volkswagen", model: "ID.4 Pro S", year: 2024, price: 43900, mileage: 4200, body_type: "SUV", color: "Kings Red", exterior_color: "Red", mpg: 104, safety_rating: 4.6, engine: "Dual Motor Electric", drivetrain: "AWD", vin: "WVGDMPE2#{rand(10..99)}P#{rand(100000..999999)}", location: "Austin, TX", image_gradient: ["#8b2233", "#6a1a26"], features: ["IQ.Drive", "Panoramic Glass Roof", "12\" Touchscreen", "Wireless CarPlay", "30-min Fast Charge", "Heated Steering Wheel"], description: "VW's electric crossover with 275-mile range and 3 years of free DC fast charging included.", image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80" },
  { make: "Honda", model: "CR-V Hybrid Sport-L", year: 2024, price: 36100, mileage: 5900, body_type: "SUV", color: "Canyon River Blue", exterior_color: "Blue", mpg: 40, safety_rating: 4.9, engine: "2.0L Hybrid", drivetrain: "AWD", vin: "7FARS6H7#{rand(10..99)}E#{rand(100000..999999)}", location: "San Diego, CA", image_gradient: ["#4a6a8a", "#3a5a7a"], features: ["Honda Sensing 360", "Bose Audio", "Wireless Charging", "Power Tailgate", "Heated/Ventilated Seats", "12.3\" Display"], description: "Best-in-class fuel economy for a compact SUV. Honda's hybrid tech delivers 40 MPG combined.", image_url: "https://images.unsplash.com/photo-1568844293986-8d0400f4745b?auto=format&fit=crop&w=800&q=80" },
  { make: "Porsche", model: "Macan", year: 2023, price: 58700, mileage: 12800, body_type: "SUV", color: "Gentian Blue", exterior_color: "Blue", mpg: 22, safety_rating: 4.7, engine: "2.0L Turbo 4-Cylinder", drivetrain: "AWD", vin: "WP1AA2A5#{rand(10..99)}LB#{rand(100000..999999)}", location: "Miami, FL", image_gradient: ["#1a3a6a", "#0e2a4a"], features: ["Sport Chrono Package", "PASM", "14-way Sport Seats", "Bose Surround", "Lane Change Assist", "Panoramic Roof"], description: "The sports car of SUVs. Porsche driving dynamics in a practical everyday package.", image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" },
  { make: "Toyota", model: "Tacoma TRD Off-Road", year: 2024, price: 40200, mileage: 8100, body_type: "Truck", color: "Lunar Rock", exterior_color: "Gray", mpg: 23, safety_rating: 4.5, engine: "2.4L Turbo iForce", drivetrain: "4WD", vin: "3TMAZ5CN#{rand(10..99)}M#{rand(100000..999999)}", location: "Flagstaff, AZ", image_gradient: ["#9aa5a0", "#7a8580"], features: ["Crawl Control", "Multi-Terrain Select", "JBL Audio", "Wireless CarPlay", "Panoramic Camera", "Locking Rear Diff"], description: "All-new Tacoma with the TRD Off-Road package. Trail-ready with multi-terrain tech.", image_url: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80" },
  { make: "Audi", model: "Q5 Premium Plus", year: 2024, price: 49800, mileage: 6700, body_type: "SUV", color: "Navarra Blue", exterior_color: "Blue", mpg: 27, safety_rating: 4.8, engine: "2.0L TFSI Turbo", drivetrain: "AWD", vin: "WA1BNAFY#{rand(10..99)}R#{rand(100000..999999)}", location: "San Francisco, CA", image_gradient: ["#1e3a5a", "#142a4a"], features: ["Virtual Cockpit Plus", "Matrix LED Headlights", "Bang & Olufsen Audio", "Air Suspension", "360 Camera", "Heated/Cooled Seats"], description: "Refined luxury SUV with Audi's quattro AWD and the latest MMI touch system.", image_url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80" },
  { make: "Rivian", model: "R1S Adventure", year: 2024, price: 78000, mileage: 2400, body_type: "SUV", color: "Forest Green", exterior_color: "Green", mpg: 95, safety_rating: 4.9, engine: "Quad Motor Electric", drivetrain: "AWD", vin: "7PDSGAAL#{rand(10..99)}N#{rand(100000..999999)}", location: "Normal, IL", image_gradient: ["#2d5a2d", "#1e3e1e"], features: ["Quad Motor", "Air Suspension", "Camp Kitchen", "Gear Tunnel", "3rd Row", "Meridian Audio", "Driver+"], description: "Electric adventure SUV with 321-mile range. Gear tunnel, camp kitchen, and quad motors.", image_url: "https://images.unsplash.com/photo-1617886903355-9354cfafbc44?auto=format&fit=crop&w=800&q=80" },
  { make: "Mazda", model: "Mazda3 Turbo", year: 2024, price: 33500, mileage: 3100, body_type: "Sedan", color: "Machine Gray", exterior_color: "Gray", mpg: 30, safety_rating: 4.6, engine: "2.5L Turbo 4-Cylinder", drivetrain: "AWD", vin: "3MZBP4EM#{rand(10..99)}M#{rand(100000..999999)}", location: "Detroit, MI", image_gradient: ["#6a6a6a", "#4a4a4a"], features: ["Bose 12-Speaker Audio", "Leather Seats", "Heads-Up Display", "Traffic Sign Recognition", "Wireless Charging", "Sunroof"], description: "Turbocharged AWD sedan with premium interior quality that rivals luxury brands.", image_url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80" },
  { make: "Ford", model: "Mustang Mach-E Select", year: 2024, price: 42900, mileage: 7200, body_type: "SUV", color: "Grabber Blue", exterior_color: "Blue", mpg: 100, safety_rating: 4.7, engine: "Electric Motor", drivetrain: "AWD", vin: "3FMTK3SU#{rand(10..99)}A#{rand(100000..999999)}", location: "Dearborn, MI", image_gradient: ["#0077b6", "#005a8a"], features: ["BlueCruise", "SYNC 4A", "Bang & Olufsen Audio", "15.5\" Screen", "Phone as Key", "Ford Connected Charge"], description: "The electric Mustang. 300-mile range with Ford's BlueCruise hands-free highway driving.", image_url: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=800&q=80" },
  { make: "Lexus", model: "RX 350h", year: 2024, price: 51200, mileage: 9400, body_type: "SUV", color: "Cloudburst Gray", exterior_color: "Gray", mpg: 37, safety_rating: 4.9, engine: "2.5L Hybrid", drivetrain: "AWD", vin: "2T2HZMDA#{rand(10..99)}C#{rand(100000..999999)}", location: "Scottsdale, AZ", image_gradient: ["#7a8890", "#5a6870"], features: ["Mark Levinson Audio", "Panoramic Roof", "14\" Touchscreen", "Lexus Safety System+", "Head-Up Display", "Digital Rearview Mirror"], description: "Lexus luxury meets hybrid efficiency. 37 MPG combined in a premium midsize SUV.", image_url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80" },
  { make: "Honda", model: "Accord Sport Hybrid", year: 2024, price: 33800, mileage: 4800, body_type: "Sedan", color: "Still Night Pearl", exterior_color: "Blue", mpg: 48, safety_rating: 4.9, engine: "2.0L Hybrid", drivetrain: "FWD", vin: "1HGCY2F6#{rand(10..99)}A#{rand(100000..999999)}", location: "Columbus, OH", image_gradient: ["#2a3a5a", "#1a2a4a"], features: ["Honda Sensing 360", "Google Built-In", "Wireless CarPlay", "12-Speaker Audio", "Wireless Charging", "Heated Seats"], description: "48 MPG and 204 hp. The Accord Hybrid proves you don't have to choose between fun and frugal.", image_url: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80" },
  { make: "GMC", model: "Sierra 1500 AT4", year: 2024, price: 56800, mileage: 10500, body_type: "Truck", color: "Volcanic Red", exterior_color: "Red", mpg: 21, safety_rating: 4.6, engine: "5.3L V8", drivetrain: "4WD", vin: "1GTP9EEL#{rand(10..99)}Z#{rand(100000..999999)}", location: "Dallas, TX", image_gradient: ["#7a2233", "#5a1a26"], features: ["MultiPro Tailgate", "CarbonPro Bed", "AT4 Off-Road Package", "Bose Audio", "Heads-Up Display", "Trailer Camera"], description: "Premium full-size truck with GMC's exclusive MultiPro tailgate and AT4 off-road capability.", image_url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80" },
  { make: "Hyundai", model: "Tucson Hybrid SEL", year: 2024, price: 33600, mileage: 5100, body_type: "SUV", color: "Amazon Gray", exterior_color: "Gray", mpg: 38, safety_rating: 4.7, engine: "1.6L Turbo Hybrid", drivetrain: "AWD", vin: "KM8JFCA1#{rand(10..99)}U#{rand(100000..999999)}", location: "Orlando, FL", image_gradient: ["#5a5a5a", "#3a3a3a"], features: ["SmartSense Safety", "Digital Key 2", "10.25\" Navigation", "Wireless Charging", "LED Headlights", "Blind Spot Cameras"], description: "Boldly designed compact SUV with hybrid efficiency and a 10-year powertrain warranty.", image_url: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=800&q=80" },
]

vehicles_data.each do |attrs|
  Vehicle.create!(attrs)
end

puts "Created #{Vehicle.count} vehicles in inventory"

# Sample Notifications (created per-user in after_create callback, but seed some for existing users)
User.find_each do |user|
  Notification.where(user: user).delete_all

  [
    { title: "Welcome to Carvana!", body: "Your account is set up. Start browsing thousands of vehicles.", notification_type: "system", icon: "sparkles" },
    { title: "Documents Verified", body: "Your driver's license has been verified successfully.", notification_type: "document_status", icon: "file_check" },
    { title: "Price Drop Alert", body: "A vehicle in your favorites just dropped by $1,200!", notification_type: "price_drop", icon: "trending_down", action_url: "/favorites" },
    { title: "Delivery Update", body: "Your vehicle has passed the 150-point inspection.", notification_type: "delivery_update", icon: "truck", action_url: "/delivery" },
    { title: "New Matches Available", body: "3 new vehicles match your preferences. Check them out!", notification_type: "recommendation", icon: "car", action_url: "/inventory" },
  ].each_with_index do |attrs, i|
    user.notifications.create!(
      **attrs,
      read: i < 2,
      read_at: i < 2 ? Time.current : nil,
      created_at: (5 - i).hours.ago
    )
  end
end

puts "Created notifications for #{User.count} users"
