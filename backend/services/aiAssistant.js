async function getAIRecommendation(bookingData) {
    const apiKey = process.env.AI_API_KEY;
    
    // Fallback if no API key is provided, so the UI still works nicely during testing
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        return {
            vehicleRecommendation: `This ${bookingData.vehicleType || 'vehicle'} is highly recommended.`,
            availabilityMessage: bookingData.availabilityStatus === 'Available' ? '✅ Vehicle available for your dates' : '❌ Vehicle not available for these dates',
            bookingAdvice: bookingData.pickupLocation?.includes('Airport') ? '✈️ Best option for airport transfer.' : '💡 Recommended for city travel and easy parking.',
            conflictWarning: bookingData.availabilityStatus === 'Available' ? '' : '⚠️ Consider selecting an alternate vehicle like Hyundai Creta.'
        };
    }

    const {
        vehicleName,
        vehicleType,
        pickupLocation,
        dropLocation,
        startDate,
        endDate,
        driverOption,
        availabilityStatus
    } = bookingData;

    const prompt = `
    You are an expert Vehicle Rental AI Assistant.
    Analyze the following booking request accurately and provide extremely helpful and precise advice.
    
    Booking Details:
    - Vehicle: ${vehicleName || 'Unknown'} (${vehicleType || 'Unknown'})
    - Pickup: ${pickupLocation || 'Unknown'}
    - Drop: ${dropLocation || 'Unknown'}
    - Dates: ${startDate || 'Not selected'} to ${endDate || 'Not selected'}
    - Driver: ${driverOption ? 'Requested' : 'Self-drive'}
    - Availability Status: ${availabilityStatus}

    Respond ONLY with a valid JSON object in this exact format, with no markdown code blocks or extra text:
    {
      "vehicleRecommendation": "Accurate suggestion if this vehicle fits their travel style (e.g., city, airport, group).",
      "availabilityMessage": "A short, clear message about availability based accurately on the status provided.",
      "bookingAdvice": "One highly useful tip for this specific rental.",
      "conflictWarning": "If availabilityStatus is unavailable, suggest an alternative vehicle. Otherwise empty."
    }
    `;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI API Response Error:", errorText);
            throw new Error("Failed to communicate with AI Service");
        }

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        
        // Clean up markdown formatting if Gemini returned it
        const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResponse = JSON.parse(jsonString);

        return parsedResponse;
    } catch (error) {
        console.error("AI API Execution Error:", error.message);
        throw new Error("Failed to communicate with AI Service");
    }
}

module.exports = { getAIRecommendation };
