// Google Sheets API configuration
const SPREADSHEET_ID = '18_R5jP6jDZk8-KtysFZ5O_yH_L6zj00fqonrNdipMB0'; // Replace with your spreadsheet ID
const SHEET_NAME = 'Wishes'; // Name of the sheet tab
const API_KEY = 'AIzaSyDjXiMZ-DXe6RNbxFblKY2TzoS2F3fuuMs'; // Replace with your API key

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
        const timestamp = new Date().toISOString();
        const values = [[name, content, timestamp]];

        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:C:append?valueInputOption=USER_ENTERED&key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: values
            })
        });

        if (response.ok) {
            // Add the new wish to the display
            addWishToDisplay(name, content);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error saving wish:', error);
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

            const name = wishForm.querySelector('input[name="name"]').value;
            const content = wishForm.querySelector('textarea[name="content"]').value;

            if (!name || !content) {
                alert('Vui lòng điền đầy đủ thông tin!');
                return;
            }

            const success = await saveWishToSheet(name, content);

            if (success) {
                wishForm.reset();
                alert('Cảm ơn bạn đã gửi lời chúc!');
            } else {
                alert('Có lỗi xảy ra, vui lòng thử lại sau!');
            }
        });
    }
});
