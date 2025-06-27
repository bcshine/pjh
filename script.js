// 전역 변수
let currentImageFile = null;
let currentImageData = null;
let userApiKey = null;

// API 키 관리
function initializeApiKey() {
    // 1순위: config.js에서 API 키 확인 (GitHub Actions 또는 로컬 환경)
    if (window.CONFIG && window.CONFIG.GEMINI_API_KEY && window.CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
        userApiKey = window.CONFIG.GEMINI_API_KEY;
        console.log('config.js에서 API 키 발견 (자동 배포)');
        return true;
    }
    
    // 2순위: 로컬스토리지에서 API 키 확인
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        userApiKey = savedApiKey;
        console.log('로컬스토리지에서 저장된 API 키 발견');
        return true;
    }
    
    console.log('API 키가 없어서 입력 모달 표시');
    return false;
}

function showApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    const input = document.getElementById('apiKeyInput');
    const saveBtn = document.getElementById('saveApiKey');
    
    modal.style.display = 'flex';
    input.focus();
    
    // 저장 버튼 이벤트
    saveBtn.onclick = function() {
        const apiKey = input.value.trim();
        if (apiKey && apiKey.startsWith('AIza')) {
            userApiKey = apiKey;
            localStorage.setItem('gemini_api_key', apiKey);
            modal.style.display = 'none';
            showToast('API 키가 저장되었습니다!');
        } else {
            alert('올바른 API 키를 입력해주세요.\n(AIza로 시작하는 키)');
        }
    };
    
    // 엔터키로 저장
    input.onkeypress = function(e) {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    };
}

function getApiKey() {
    return userApiKey;
}

// DOM 요소들
const elements = {
    // 샘플 이미지
    sampleItems: document.querySelectorAll('.sample-item'),
    
    // 업로드 관련
    cameraBtn: document.getElementById('cameraBtn'),
    galleryBtn: document.getElementById('galleryBtn'),
    fileInput: document.getElementById('fileInput'),
    galleryInput: document.getElementById('galleryInput'),
    
    // 미리보기
    previewSection: document.getElementById('previewSection'),
    previewImage: document.getElementById('previewImage'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    
    // 로딩
    loadingSection: document.getElementById('loadingSection'),
    
    // 결과
    resultSection: document.getElementById('resultSection'),
    foodName: document.getElementById('foodName'),
    calorieValue: document.getElementById('calorieValue'),
    calculationList: document.getElementById('calculationList'),
    exerciseList: document.getElementById('exerciseList'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    
    // 섹션들
    sampleSection: document.getElementById('sampleSection'),
    uploadSection: document.getElementById('uploadSection')
};

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    console.log('앱 초기화 시작');
    
    // API 키 초기화
    if (!initializeApiKey()) {
        // API 키가 없으면 모달 표시
        setTimeout(() => showApiKeyModal(), 1000);
    }
    
    // DOM 요소 확인
    console.log('galleryBtn:', elements.galleryBtn);
    console.log('galleryInput:', elements.galleryInput);
    console.log('fileInput:', elements.fileInput);
    
    // 샘플 이미지 클릭 이벤트
    elements.sampleItems.forEach(item => {
        item.addEventListener('click', () => handleSampleImageClick(item));
    });
    
    // 카메라 버튼
    elements.cameraBtn.addEventListener('click', () => {
        console.log('카메라 버튼 클릭');
        elements.fileInput.click();
    });
    
    // 갤러리 버튼
    elements.galleryBtn.addEventListener('click', () => {
        console.log('갤러리 버튼 클릭');
        elements.galleryInput.click();
    });
    
    // 파일 업로드 이벤트
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.galleryInput.addEventListener('change', handleFileSelect);
    
    // 분석 버튼
    elements.analyzeBtn.addEventListener('click', analyzeImage);
    
    // 복사 버튼
    elements.copyBtn.addEventListener('click', copyResults);
    
    // 리셋 버튼
    elements.resetBtn.addEventListener('click', resetApp);
}

// 샘플 이미지 클릭 처리
async function handleSampleImageClick(item) {
    const imagePath = item.dataset.image;
    const imageElement = item.querySelector('img');
    
    try {
        // 이미지를 Blob으로 변환
        const response = await fetch(imagePath);
        const blob = await response.blob();
        
        // 파일 객체 생성
        const fileName = imagePath.split('/').pop();
        currentImageFile = new File([blob], fileName, { type: blob.type });
        
        // 미리보기 표시
        showPreview(imageElement.src);
        
    } catch (error) {
        console.error('샘플 이미지 로드 실패:', error);
        alert('샘플 이미지를 로드할 수 없습니다.');
    }
}

// 파일 선택 처리
function handleFileSelect(event) {
    console.log('파일 선택 이벤트 발생:', event.target.files);
    
    const file = event.target.files[0];
    if (!file) {
        console.log('선택된 파일이 없습니다.');
        return;
    }
    
    console.log('선택된 파일:', file.name, file.type, file.size);
    
    if (file.type.startsWith('image/')) {
        currentImageFile = file;
        console.log('이미지 파일 확인됨, 미리보기 생성 중...');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('파일 읽기 완료, 미리보기 표시');
            showPreview(e.target.result);
        };
        reader.onerror = (e) => {
            console.error('파일 읽기 오류:', e);
            alert('파일을 읽을 수 없습니다.');
        };
        reader.readAsDataURL(file);
    } else {
        console.log('이미지 파일이 아닙니다:', file.type);
        alert('이미지 파일을 선택해주세요.');
    }
}



// 미리보기 표시
function showPreview(imageSrc) {
    console.log('미리보기 표시 함수 호출:', imageSrc ? '이미지 있음' : '이미지 없음');
    
    if (!imageSrc) {
        console.error('이미지 소스가 없습니다.');
        return;
    }
    
    elements.previewImage.src = imageSrc;
    elements.previewSection.style.display = 'block';
    elements.previewSection.classList.add('fade-in');
    
    console.log('미리보기 섹션 표시됨');
    
    // 스크롤을 미리보기 섹션으로 이동
    elements.previewSection.scrollIntoView({ behavior: 'smooth' });
}

// 이미지 분석
async function analyzeImage() {
    if (!currentImageFile) {
        alert('분석할 이미지를 선택해주세요.');
        return;
    }

    try {
        // 로딩 표시
        showLoading();
        
        // 1단계: API 키 확인
        console.log('1단계: API 키 확인 중...');
        if (!getApiKey()) {
            showApiKeyModal();
            throw new Error('API 키가 설정되지 않았습니다.');
        }
        
        // 2단계: 이미지 크기 확인 및 압축
        console.log('2단계: 이미지 처리 중...', currentImageFile.size, 'bytes');
        const processedFile = await processImage(currentImageFile);
        
        // 3단계: base64 변환
        console.log('3단계: Base64 변환 중...');
        const base64Data = await convertToBase64(processedFile);
        
        // 4단계: API 호출
        console.log('4단계: API 호출 중...');
        const result = await callGeminiAPI(base64Data);
        
        // 5단계: 결과 표시
        console.log('5단계: 결과 표시');
        showResults(result);
        
    } catch (error) {
        console.error('분석 오류 상세:', error);
        hideLoading();
        
        let errorMessage = '이미지 분석 중 오류가 발생했습니다.\n\n';
        
        if (error.message.includes('API 키')) {
            errorMessage += '문제: API 키가 설정되지 않았습니다.\n해결: config.js 파일을 확인해주세요.';
        } else if (error.message.includes('네트워크')) {
            errorMessage += '문제: 네트워크 연결 오류\n해결: 인터넷 연결을 확인해주세요.';
        } else if (error.message.includes('크기')) {
            errorMessage += '문제: 이미지 파일이 너무 큽니다.\n해결: 5MB 이하의 이미지를 사용해주세요.';
        } else {
            errorMessage += `오류 내용: ${error.message}\n\n개발자 도구(F12)에서 자세한 오류를 확인할 수 있습니다.`;
        }
        
        alert(errorMessage);
    }
}

// 이미지 처리 (크기 압축)
function processImage(file) {
    return new Promise((resolve, reject) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const maxWidth = 1024;
        const maxHeight = 1024;
        
        if (file.size <= maxSize) {
            resolve(file);
            return;
        }
        
        console.log('이미지가 큼, 압축 중...', file.size);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // 비율 유지하면서 크기 조절
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    console.log('압축 완료:', compressedFile.size);
                    resolve(compressedFile);
                } else {
                    reject(new Error('이미지 압축 실패'));
                }
            }, 'image/jpeg', 0.8);
        };
        
        img.onerror = () => reject(new Error('이미지 로드 실패'));
        img.src = URL.createObjectURL(file);
    });
}

// 이미지를 base64로 변환
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Gemini API 호출
async function callGeminiAPI(base64Data) {
    // API 키 확인
    const API_KEY = getApiKey();
    if (!API_KEY) {
        throw new Error('API 키가 설정되지 않았습니다.');
    }
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const prompt = `이 음식 이미지를 보고 음식 이름과 칼로리를 알려주세요. 다음 JSON 형식으로 답변해주세요:

{
"foodName": "음식이름",
"calories": 400,
"calculationSteps": ["재료 확인", "1인분 기준 계산", "총 칼로리 산출"]
}

관대하게 추정해서 답변해주세요.`;

    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: currentImageFile.type,
                        data: base64Data
                    }
                }
            ]
        }]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API 응답 오류:', errorText);
            throw new Error(`API 호출 실패: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API 응답:', data);
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
        
        const text = data.candidates[0].content.parts[0].text;
        console.log('AI 응답 텍스트:', text);
        
        // JSON 파싱 (여러 패턴 시도)
        let jsonData = null;
        
        // 1. 마크다운 코드 블록에서 JSON 추출
        let jsonMatch = text.match(/```json\s*\n([\s\S]*?)\n\s*```/);
        if (jsonMatch) {
            try {
                jsonData = JSON.parse(jsonMatch[1]);
            } catch (e) {
                console.log('마크다운 JSON 파싱 실패:', e);
            }
        }
        
        // 2. 중괄호로 둘러싸인 JSON 추출
        if (!jsonData) {
            jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    jsonData = JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.log('일반 JSON 파싱 실패:', e);
                }
            }
        }
        
        // 3. 파싱 실패시 기본값 반환
        if (!jsonData) {
            console.log('JSON 파싱 실패, 기본값 사용');
            return {
                foodName: "음식 (인식 어려움)",
                calories: 400,
                calculationSteps: [
                    "이미지에서 음식을 확인했습니다",
                    "일반적인 1인분 기준으로 추정했습니다", 
                    "대략적인 칼로리를 계산했습니다"
                ]
            };
        }
        
        return jsonData;
        
    } catch (error) {
        console.error('API 호출 중 오류:', error);
        throw new Error('음식 인식 중 오류가 발생했습니다: ' + error.message);
    }
}

// 로딩 표시
function showLoading() {
    elements.previewSection.style.display = 'none';
    elements.resultSection.style.display = 'none';
    elements.loadingSection.style.display = 'block';
    elements.loadingSection.classList.add('fade-in');
    
    elements.loadingSection.scrollIntoView({ behavior: 'smooth' });
}

// 로딩 숨기기
function hideLoading() {
    elements.loadingSection.style.display = 'none';
}

// 결과 표시
function showResults(result) {
    hideLoading();
    
    // 음식 이름과 칼로리 표시
    elements.foodName.textContent = result.foodName || '알 수 없는 음식';
    elements.calorieValue.textContent = result.calories || '0';
    
    // 계산 과정 표시
    elements.calculationList.innerHTML = '';
    if (result.calculationSteps && result.calculationSteps.length > 0) {
        result.calculationSteps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            elements.calculationList.appendChild(li);
        });
    }
    
    // 운동량 계산 및 표시
    const exercises = calculateExercise(result.calories || 0);
    displayExercises(exercises);
    
    // 결과 섹션 표시
    elements.resultSection.style.display = 'block';
    elements.resultSection.classList.add('fade-in');
    
    elements.resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 운동량 계산
function calculateExercise(calories) {
    const exercises = [
        { name: '달리기 (8km/h)', caloriePerMin: 10, icon: '🏃‍♂️' },
        { name: '걷기 (5km/h)', caloriePerMin: 4, icon: '🚶‍♂️' },
        { name: '자전거 타기', caloriePerMin: 8, icon: '🚴‍♂️' },
        { name: '수영', caloriePerMin: 12, icon: '🏊‍♂️' },
        { name: '등산', caloriePerMin: 9, icon: '🧗‍♂️' },
        { name: '요가', caloriePerMin: 3, icon: '🧘‍♀️' }
    ];
    
    return exercises.map(exercise => {
        const minutes = Math.round(calories / exercise.caloriePerMin);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        let duration;
        if (hours > 0) {
            duration = `${hours}시간 ${remainingMinutes}분`;
        } else {
            duration = `${minutes}분`;
        }
        
        return {
            ...exercise,
            duration: duration
        };
    });
}

// 운동량 표시
function displayExercises(exercises) {
    elements.exerciseList.innerHTML = '';
    
    exercises.forEach(exercise => {
        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-item';
        exerciseItem.innerHTML = `
            <span class="exercise-name">${exercise.icon} ${exercise.name}</span>
            <span class="exercise-duration">${exercise.duration}</span>
        `;
        elements.exerciseList.appendChild(exerciseItem);
    });
}

// 결과 복사
function copyResults() {
    const foodName = elements.foodName.textContent;
    const calories = elements.calorieValue.textContent;
    const calculations = Array.from(elements.calculationList.children)
        .map(li => `• ${li.textContent}`)
        .join('\n');
    
    const exercises = Array.from(elements.exerciseList.children)
        .map(item => {
            const name = item.querySelector('.exercise-name').textContent;
            const duration = item.querySelector('.exercise-duration').textContent;
            return `• ${name}: ${duration}`;
        })
        .join('\n');
    
    const resultText = `🍽️ 음식 칼로리 분석 결과

음식명: ${foodName}
칼로리: ${calories}kcal

📊 계산 과정:
${calculations}

🏃‍♂️ 칼로리 소모 운동량:
${exercises}

#음식칼로리 #칼로리계산기`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(resultText).then(() => {
            showToast('결과가 클립보드에 복사되었습니다!');
        }).catch(() => {
            fallbackCopyText(resultText);
        });
    } else {
        fallbackCopyText(resultText);
    }
}

// 클립보드 API가 지원되지 않을 때의 대체 복사 방법
function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('결과가 클립보드에 복사되었습니다!');
    } catch (error) {
        console.error('복사 실패:', error);
        showToast('복사에 실패했습니다.');
    }
    
    document.body.removeChild(textArea);
}

// 토스트 메시지 표시
function showToast(message) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: fadeIn 0.3s ease-in;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 2000);
}

// 앱 초기화
function resetApp() {
    currentImageFile = null;
    currentImageData = null;
    
    // 모든 섹션 숨기기
    elements.previewSection.style.display = 'none';
    elements.loadingSection.style.display = 'none';
    elements.resultSection.style.display = 'none';
    
    // 파일 입력 초기화
    elements.fileInput.value = '';
    elements.galleryInput.value = '';
    
    // 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
        }
    }
`;
document.head.appendChild(style); 