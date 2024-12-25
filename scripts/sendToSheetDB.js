document.addEventListener("DOMContentLoaded", () => {
    const attendeesInput = document.getElementById("attendees");
    const amountDisplay = document.getElementById("amount");

    // Cost per person
    const originalPrice = 500;

    // Calculate total amount
    const calculateAmount = () => {
        const attendees = parseInt(attendeesInput.value) || 0;
        const totalAmount = attendees * originalPrice;
        amountDisplay.textContent = `Total Amount: ₹${totalAmount.toFixed(2)}`;
    };

    // Attach the calculateAmount function to the attendees input
    attendeesInput.addEventListener("input", calculateAmount);

    // Handle form submission
    const registrationForm = document.getElementById("registrationForm");
    registrationForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const attendees = attendeesInput.value.trim();
        const eventDate = document.querySelector('input[name="event_date"]:checked')?.value;

        if (!name || !phone || !attendees || !eventDate) {
            alert("Please fill in all required fields, including selecting an event date.");
            return;
        }

        // Get the current date and time in IST
        const currentDate = new Date();
        const utcOffsetInMilliseconds = currentDate.getTimezoneOffset() * 60000;
        const istOffsetInMilliseconds = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(currentDate.getTime() + utcOffsetInMilliseconds + istOffsetInMilliseconds);

        const timestamp = istDate.toISOString();
        const submission_date = istDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

        // Prepare data for submission
        const formData = {
            name: name,
            phone: phone,
            attendees: attendees,
            event_date: eventDate,
            timestamp: timestamp,
            submission_date: submission_date
        };

        // Access the SheetDB API URL from the environment
        const sheetDBUrl = process.env.SHEETDB_API_URL;

        if (!sheetDBUrl) {
            console.error("SHEETDB_API_URL is not defined in the environment.");
            alert("Configuration error: API URL is missing.");
            return;
        }

        // Send data to SheetDB API
        fetch(sheetDBUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data: formData }) // Wrap the form data
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            alert(`Thank you for registering, ${name}!\nYour data has been successfully submitted.`);
            registrationForm.reset();
            amountDisplay.textContent = "Total Amount: ₹0";
        })
        .catch(error => {
            console.error("Error submitting data to SheetDB: ", error);
            alert("An error occurred while submitting your data. Please try again.");
        });
    });
});
