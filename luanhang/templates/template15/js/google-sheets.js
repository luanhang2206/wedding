// Google Sheets API configuration
const SPREADSHEET_ID = '18_R5jP6jDZk8-KtysFZ5O_yH_L6zj00fqonrNdipMB0'; // Replace with your spreadsheet ID
const SHEET_NAME = 'Wishes'; // Name of the sheet tab
const API_KEY = 'AIzaSyDjXiMZ-DXe6RNbxFblKY2TzoS2F3fuuMs'; // Replace with your API key
const APP_URL = 'https://script.google.com/macros/s/AKfycbxCTzB3cFYkL2_Yy3WAjc6SPoZf91DTW2-LgO6a3mGRFdWX_kO8vvtrs_1Yn6OBRGyt/exec'

// Function to load wishes from Google Sheets
async function loadWishesFromSheet() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`);
        const data = await response.json();

        if (data.values && data.values.length > 1) { // Skip header row
            const wishes = data.values.slice(1).map(row => ({
                name: row[0],
                content: row[1],
                timestamp: row[2]
            }));

            // Update the wishes display
            updateWishesDisplay(wishes);
        }
    } catch (error) {
        console.error('Error loading wishes:', error);
    }
}

// Function to save a new wish to Google Sheets
async function saveWishToSheet(name, content) {
    try {
        $("#loader").css("display", "inline-block");

        const response = await fetch(APP_URL, {
            // mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({ name, content }),
        });

        const text = await response.text();

        if (response.ok) {
            addWishToDisplay(name, content);

            $( "#loader").hide();
            $( "#success").html('Cám ơn bạn đã gửi lời chúc đến chúng mình').slideDown( "slow" );
            setTimeout(function() {
                $( "#success").slideUp( "slow" );
            }, 5000);
            return true;
        } else {
            $( "#error").html('Gửi lời chúc thất bại').slideDown( "slow" );
            error(function() {
                $( "#error").slideUp( "slow" );
            }, 5000);
            return false;
        }
    } catch (error) {
        setTimeout(function() {
            $( "#error").slideUp( "slow" );
        }, 5000);
        return false;

    }
}

// Function to update the wishes display
function updateWishesDisplay(wishes) {
    const wishBox = document.querySelector('.wish-box');
    if (!wishBox) return;

    // Clear existing wishes
    wishBox.innerHTML = '';

    // Add each wish
    wishes.forEach((wish, index) => {
        const wishElement = document.createElement('div');
        wishElement.className = `wish-box-item ${index % 2 === 1 ? 'bg' : ''}`;
        wishElement.innerHTML = `
            <strong>${wish.name}</strong>
            <p>${wish.content}</p>
        `;
        wishBox.appendChild(wishElement);
    });
}

// Function to add a single wish to the display
function addWishToDisplay(name, content) {
    const wishBox = document.querySelector('.wish-box');
    if (!wishBox) return;

    const wishElement = document.createElement('div');
    wishElement.className = `wish-box-item ${wishBox.children.length % 2 === 1 ? 'bg' : ''}`;
    wishElement.innerHTML = `
        <strong>${name}</strong>
        <p>${content}</p>
    `;
    wishBox.appendChild(wishElement);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load existing wishes
    loadWishesFromSheet();

    // Handle form submission
    const wishForm = document.getElementById('wish-form');
    if (wishForm) {
        wishForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = wishForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            const name = wishForm.querySelector('input[name="name"]').value;
            const content = wishForm.querySelector('textarea[name="content"]').value;

            console.log('object', name, 'content', content);
            let success;
            if (name.trim() !== "" && content.trim() !== "") {
                success = await saveWishToSheet(name, content);
            }

            if (success) {
                wishForm.reset();
            }
            if (submitBtn) submitBtn.disabled = false;
        });
    }
});
