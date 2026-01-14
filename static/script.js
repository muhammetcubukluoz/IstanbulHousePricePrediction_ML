let currentStep = 0;
const totalSteps = 5;
let selectedDistrict = '';
let activeAlert = null;
const GENERIC_ERROR_MESSAGE = "Lütfen gerekli tüm alanları girdiğinizden emin olun!";

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    updateStepDisplay();

    // Dropdown dışına tıklandığında kapat
    document.addEventListener('click', function(event) {
        const dropdowns = document.querySelectorAll('.custom-select');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove('open');
            }
        });
    });
});

// Genel dropdown toggle fonksiyonu
function toggleDropdown(selectId) {
    console.log('toggleDropdown called:', selectId);

    const select = document.getElementById(selectId);
    if (!select) {
        console.error('Select element not found:', selectId);
        return;
    }

    console.log('Select element found, toggling open class');

    const allSelects = document.querySelectorAll('.custom-select');

    // Diğer açık dropdown'ları kapat
    allSelects.forEach(s => {
        if (s.id !== selectId) {
            s.classList.remove('open');
        }
    });

    select.classList.toggle('open');

    console.log('Dropdown is now:', select.classList.contains('open') ? 'OPEN' : 'CLOSED');

    // Arama kutusu olan dropdown'lar için focus
    if (select.classList.contains('open')) {
        setTimeout(() => {
            const searchInput = select.querySelector('input[type="text"]');
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    }
}

// İlçe dropdown toggle (backward compatibility)
function toggleDistrictDropdown() {
    toggleDropdown('district-select');
}

// Genel seçim fonksiyonu
function selectOption(type, value, displayText) {
    console.log('selectOption called:', type, value, displayText);

    const mappings = {
        'room': { selected: 'selected-room', input: 'Room_number', select: 'room-select' },
        'age': { selected: 'selected-age', input: 'Building_Age', select: 'age-select' },
        'heating': { selected: 'selected-heating', input: 'Heating', select: 'heating-select' },
        'loan': { selected: 'selected-loan', input: 'Available_for_Loan', select: 'loan-select' },
        'fromwho': { selected: 'selected-fromwho', input: 'From_who', select: 'fromwho-select' },
        'floor': { selected: 'selected-floor', input: 'Laminate_Floor', select: 'floor-select' },
        'floor-location': { selected: 'selected-floor-location', input: 'Floor_location', select: 'floor-location-select' },
        'total-floors': { selected: 'selected-total-floors', input: 'Number_of_floors', select: 'total-floors-select' }
    };

    const mapping = mappings[type];
    if (!mapping) {
        console.error('Mapping not found for type:', type);
        return;
    }

    console.log('Mapping found:', mapping);

    const selectedElement = document.getElementById(mapping.selected);
    const inputElement = document.getElementById(mapping.input);
    const selectElement = document.getElementById(mapping.select);

    console.log('Elements:', {
        selectedElement,
        inputElement,
        selectElement
    });

    if (!selectedElement || !inputElement || !selectElement) {
        console.error('Elements not found:', mapping);
        return;
    }

    selectedElement.textContent = displayText;
    inputElement.value = value;
    selectElement.classList.remove('open');

    console.log('Selection successful:', displayText, value);

    // Seçili olanı işaretle
    selectElement.querySelectorAll('.select-option').forEach(option => {
        const normalizedOptionText = option.textContent.trim().replace(/\s+/g, ' ');
        const normalizedDisplayText = displayText.trim().replace(/\s+/g, ' ');

        option.classList.remove('selected');
        if (normalizedOptionText === normalizedDisplayText) {
            option.classList.add('selected');
        }
    });

    // Border rengini düzelt
    const selectSelected = selectElement.querySelector('.select-selected');
    if (selectSelected) {
        selectSelected.style.borderColor = '#d1d5db';
    }
}

// İlçe seçimi (backward compatibility)
function selectDistrict(district) {
    selectedDistrict = district;
    document.getElementById('selected-district').textContent = district;
    document.getElementById('District').value = district;
    document.getElementById('district-select').classList.remove('open');

    // Seçili olanı işaretle
    document.querySelectorAll('#district-options .select-option').forEach(option => {
        // Boşlukları normalize et
        // HTML yapısında satır sonu bulunuyor
        const normalizedOptionText = option.textContent.trim().replace(/\s+/g, ' ');
        const normalizedDistrict = district.trim().replace(/\s+/g, ' ');

        option.classList.remove('selected');
        if (normalizedOptionText === normalizedDistrict) {
            option.classList.add('selected');
        }
    });

    // Border rengini düzelt
    document.querySelector('#district-select .select-selected').style.borderColor = '#d1d5db';
}

// Filtreleme fonksiyonları
function filterDistricts() {
    const searchValue = document.getElementById('district-search').value.toLowerCase();
    const options = document.querySelectorAll('#district-options .select-option');

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(searchValue)) {
            option.classList.remove('hidden');
        } else {
            option.classList.add('hidden');
        }
    });
}

function nextStep() {
    // Mevcut adımın validasyonunu yap
    if (!validateCurrentStep()) {
        return;
    }

    // Son adımda tahmin yap
    if (currentStep === 3) {
        makePrediction();
    }

    // Sonraki adıma geç
    if (currentStep < totalSteps - 1) {
        currentStep++;
        updateStepDisplay();
    }
}

function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    // Tüm adımları gizle
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });

    // Mevcut adımı göster
    document.getElementById(`content-${currentStep}`).classList.add('active');

    // Progress bar'ı güncelle
    document.querySelectorAll('.step').forEach((step, index) => {
        const icon = step.querySelector('.step-icon');
        const line = document.querySelectorAll('.step-line')[index];

        if (index < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
            icon.classList.add('completed');
            icon.classList.remove('active');
            if (line) line.classList.add('completed');
        } else if (index === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
            icon.classList.add('active');
            icon.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
            icon.classList.remove('active', 'completed');
            if (line) line.classList.remove('completed');
        }
    });

    // Buton görünürlüğünü güncelle
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (currentStep === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-block';
    }

    if (currentStep === totalSteps - 1) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'inline-block';
        nextBtn.textContent = currentStep === 3 ? 'Tahmin Et' : 'Devam Et';
    }
}

function validateCurrentStep() {
    let isValid = true; // Genel validasyon durumu

    if (currentStep === 0) {
        const district = document.getElementById('District').value;
        const neighborhoodInput = document.getElementById('Neighborhood');
        const neighborhood = neighborhoodInput.value.trim();

        const neighborhoodRegex = /^[A-Za-zÇĞİÖŞÜçğıöşü\s]+ Mah\.$/;

        // District kontrolü
        if (!district || district.trim() === '') {
            document.querySelector('#district-select .select-selected').style.borderColor = '#ef4444';
            isValid = false;
        } else {
            document.querySelector('#district-select .select-selected').style.borderColor = '#d1d5db';
        }

        // Neighborhood kontrolü (Mah. formatı)
        if (!neighborhood || !neighborhoodRegex.test(neighborhood)) {
            neighborhoodInput.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            neighborhoodInput.style.borderColor = '#d1d5db';
        }

        if (!isValid) showAlert(GENERIC_ERROR_MESSAGE);
        return isValid;
    }

    if (currentStep === 1) {
        const requiredFields = [
            { id: 'm2_Net' },
            { id: 'Room_number', selectId: 'room-select' },
            { id: 'Livingroom_number' },
            { id: 'Number_of_bathrooms' },
            { id: 'Building_Age', selectId: 'age-select' },
            { id: 'Floor_location', selectId: 'floor-location-select' },
            { id: 'Number_of_floors', selectId: 'total-floors-select' }
        ];

        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);

            // + / - butonlarına basınca sadece borderı eski haline döndür
            if (['m2_Net', 'Livingroom_number', 'Number_of_bathrooms'].includes(field.id)) {
                const container = element.closest('.input-with-controls'); // input ve butonları saran div
                if (container) {
                    container.querySelectorAll('.control-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            element.style.borderColor = '#d1d5db'; // border griye dönsün
                        });
                    });
                }
            }

            // Validasyon
            if (!element.value || element.value.trim() === '') {
                if (field.selectId) {
                    document.querySelector(`#${field.selectId} .select-selected`).style.borderColor = '#ef4444';
                } else {
                    element.style.borderColor = '#ef4444';
                }
                isValid = false;
            } else {
                if (field.selectId) {
                    document.querySelector(`#${field.selectId} .select-selected`).style.borderColor = '#d1d5db';
                } else {
                    element.style.borderColor = '#d1d5db';
                }
            }
        });

        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            console.log(`${field.id}:`, element.value);
        });

        if (!isValid) showAlert(GENERIC_ERROR_MESSAGE);
        return isValid;
    }




    if (currentStep === 2) {
        const requiredFields = [
            { id: 'Heating', selectId: 'heating-select' },
            { id: 'Available_for_Loan', selectId: 'loan-select' },
            { id: 'From_who', selectId: 'fromwho-select' },
            { id: 'Laminate_Floor', selectId: 'floor-select' }
        ];

        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element.value || element.value.trim() === '') {
                document.querySelector(`#${field.selectId} .select-selected`).style.borderColor = '#ef4444';
                isValid = false;
            } else {
                document.querySelector(`#${field.selectId} .select-selected`).style.borderColor = '#d1d5db';
            }
        });

        if (!isValid) showAlert(GENERIC_ERROR_MESSAGE);
        return isValid;
    }

    // Diğer adımlar için genel input validasyonu
    const currentContent = document.getElementById(`content-${currentStep}`);
    const requiredInputs = currentContent.querySelectorAll('input[required]:not([type="hidden"])');

    requiredInputs.forEach(input => {
        if (!input.value || input.value.trim() === '') {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#d1d5db';
        }
    });

    if (!isValid) showAlert(GENERIC_ERROR_MESSAGE);
    return isValid;
}


// Checkbox değişikliklerini dinle
const checkboxItems = document.querySelectorAll('.checkbox-item');

checkboxItems.forEach(item => {
    const checkbox = item.querySelector('input[type="checkbox"]');

    checkbox.addEventListener('change', () => {
        item.classList.toggle('checked', checkbox.checked);
        updateCounts();
    });
});

// Sayaçları güncelle
function updateCounts() {
    document.querySelectorAll('[data-section]').forEach(section => {
        const count = section.querySelectorAll('input[type="checkbox"]:checked').length;
        const countElement = section.previousElementSibling.querySelector('.count');
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// Formdan checkbox verilerini al (collectFormData içinde kullanılacak)
function getCheckboxValue(id) {
    return document.getElementById(id).checked ? 1 : 0;
}

// Sayfa yüklendiğinde başlangıç sayaçlarını güncelle
document.addEventListener('DOMContentLoaded', function() {
    updateCounts();
});

function collectFormData() {
    return {
        District: document.getElementById('District').value,
        Neighborhood: document.getElementById('Neighborhood').value,
        m2_Net: parseFloat(document.getElementById('m2_Net').value),
        Livingroom_number: parseInt(document.getElementById('Livingroom_number').value),
        Room_number: parseFloat(document.getElementById('Room_number').value),
        Building_Age: document.getElementById('Building_Age').value,
        Floor_location: parseInt(document.getElementById('Floor_location').value),
        Number_of_floors: parseInt(document.getElementById('Number_of_floors').value),
        Heating: document.getElementById('Heating').value,
        Number_of_bathrooms: parseInt(document.getElementById('Number_of_bathrooms').value),
        Available_for_Loan: document.getElementById('Available_for_Loan').value,
        From_who: document.getElementById('From_who').value,
        Front_West: getCheckboxValue('Front_West'),
        Front_East: getCheckboxValue('Front_East'),
        Front_South: getCheckboxValue('Front_South'),
        Front_North: getCheckboxValue('Front_North'),
        Internet: getCheckboxValue('Internet'),
        Security_Alarm: getCheckboxValue('Security_Alarm'),
        Smart_House: getCheckboxValue('Smart_House'),
        Elevator: getCheckboxValue('Elevator'),
        Balcony: getCheckboxValue('Balcony'),
        Car_Park: getCheckboxValue('Car_Park'),
        Laminate_Floor: parseInt(document.getElementById('Laminate_Floor').value),
        Luxury_Facilities: getCheckboxValue('Luxury_Facilities'),
        Airport: getCheckboxValue('Airport'),
        Marmaray: getCheckboxValue('Marmaray'),
        Metro: getCheckboxValue('Metro'),
        Metrobus: getCheckboxValue('Metrobus'),
        Minibus: getCheckboxValue('Minibus'),
        Bus_stop: getCheckboxValue('Bus_stop'),
        Tram: getCheckboxValue('Tram'),
        Railway_station: getCheckboxValue('Railway_station'),
        TEM: getCheckboxValue('TEM'),
        E_5: getCheckboxValue('E_5')
    };
}

async function makePrediction() {
    const formData = collectFormData();

    // Loading göster
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result-content').style.display = 'none';
    document.getElementById('error-content').style.display = 'none';

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Tahmin yapılırken bir hata oluştu.');
        }

        const result = await response.json();

        // Sonucu göster
        document.getElementById('loading').style.display = 'none';
        document.getElementById('result-content').style.display = 'block';

        // Fiyatı formatla
        const formattedPrice = new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(result.predicted_price_TL);

        document.getElementById('predicted-price').textContent = formattedPrice;

    } catch (error) {
        // Hata göster
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-content').style.display = 'block';
        document.getElementById('error-message').textContent = error.message;
    }
}

// Yeni tahmin butonu için
function resetForm() {
    currentStep = 0;
    document.querySelectorAll('input, select').forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    updateStepDisplay();
}

// Enter tuşu ile devam etme
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && currentStep < totalSteps - 1) {
        nextStep();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const incrementButtons = document.querySelectorAll(".plus");
    const decrementButtons = document.querySelectorAll(".minus");

    incrementButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const input = btn.closest(".input-with-controls").querySelector("input");
            let value = parseInt(input.value) || 0;

            // Sadece m2_Net id'si için step 5, diğerleri 1
            const step = input.id === "m2_Net" ? 5 : 1;
            const max = parseInt(input.max) || Infinity;
            input.value = Math.min(value + step, max);
        });
    });

    decrementButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const input = btn.closest(".input-with-controls").querySelector("input");
            let value = parseInt(input.value) || 0;

            const step = input.id === "m2_Net" ? 5 : 1;
            const min = parseInt(input.min) || 0;
            input.value = Math.max(value - step, min);
        });
    });
});


function showAlert(message, type = "error", duration = 4000) {
    // Eski alert varsa kapat
    if (activeAlert) {
        activeAlert.remove();
        activeAlert = null;
    }

    let container = document.getElementById("alert-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "alert-container";
        document.body.appendChild(container);
    }

    const alert = document.createElement("div");
    alert.className = `custom-alert ${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button class="close-btn">&times;</button>
        <div class="timer-bar"></div>
    `;

    container.appendChild(alert);
    activeAlert = alert;

    const timerBar = alert.querySelector(".timer-bar");
    timerBar.style.animationDuration = `${duration}ms`;

    let timeout = setTimeout(() => {
        alert.remove();
        activeAlert = null;
    }, duration);

    // Hover → timer durur
    alert.addEventListener("mouseenter", () => {
        clearTimeout(timeout);
        timerBar.style.animationPlayState = "paused";
    });

    // Mouse çıkınca → devam
    alert.addEventListener("mouseleave", () => {
        timerBar.style.animationPlayState = "running";
        timeout = setTimeout(() => {
            alert.remove();
            activeAlert = null;
        }, 2000);
    });

    // X ile kapatma
    alert.querySelector(".close-btn").addEventListener("click", () => {
        alert.remove();
        activeAlert = null;
    });
}
