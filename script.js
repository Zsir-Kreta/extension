const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const colorInput = document.querySelector('input[type="color"]');
const form = document.querySelector("form");
const body = document.body;

const updateStorage = (name, value) => {
    let item = {};
    item[name] = value;
    chrome.storage.sync.set(item);
};

const toggleDarkMode = (isEnabled) => {
    if (isEnabled) {
        body.classList.add("dark");
        form.classList.add("dark");
    } else {
        body.classList.remove("dark");
        form.classList.remove("dark");
    }
};

const handleCheckboxChange = (checkbox) => {
    updateStorage(checkbox.name, checkbox.checked);
    if (checkbox.name === "darkMode") {
        toggleDarkMode(checkbox.checked);
        if (checkbox.checked) {
            const customColorModeCheckbox = document.querySelector('input[name="customColorMode"]');
            if (customColorModeCheckbox) {
                customColorModeCheckbox.checked = false;
                updateStorage("customColorMode", false);
            }
        }
    } else if (checkbox.name === "customColorMode" && checkbox.checked) {
        const darkModeCheckbox = document.querySelector('input[name="darkMode"]');
        if (darkModeCheckbox) {
            darkModeCheckbox.checked = false;
            updateStorage("darkMode", false);
            toggleDarkMode(false);
        }
    }
};

const handleColorInputChange = (colorInput) => {
    updateStorage(colorInput.name, colorInput.value);
};

checkboxes.forEach(checkbox => {
    chrome.storage.sync.get([checkbox.name], function(result) {
        if (result[checkbox.name] === true) {
            checkbox.checked = true;
            if (checkbox.name === "darkMode") {
                toggleDarkMode(true);
            }
        }
    });
    checkbox.addEventListener('change', () => handleCheckboxChange(checkbox));
});

chrome.storage.sync.get(['bgColor'], function(result) {
    if (result.bgColor) {
        colorInput.value = result.bgColor;
    }
});

colorInput.addEventListener('input', () => handleColorInputChange(colorInput));