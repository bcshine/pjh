// 전역 변수
let currentImageFile = null;
let currentImageData = null;

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
        
        // 이미지를 base64로 변환
        const base64Data = await convertToBase64(currentImageFile);
        
        // Gemini API 호출
        const result = await callGeminiAPI(base64Data);
        
        // 결과 표시
        showResults(result);
        
    } catch (error) {
        console.error('분석 오류:', error);
        alert('이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
        hideLoading();
    }
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
    const API_KEY = window.CONFIG.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const prompt = `
    이 음식 이미지를 분석해서 다음 정보를 JSON 형태로 제공해주세요:
    
    {
        "foodName": "음식 이름 (한국어)",
        "calories": 예상 칼로리 (숫자만),
        "calculationSteps": [
            "계산 과정 1",
            "계산 과정 2",
            "계산 과정 3"
        ]
    }
    
    주의사항:
    - 칼로리는 일반적인 1인분 기준으로 계산해주세요
    - 계산 과정은 구체적으로 3-5단계로 나누어서 설명해주세요
    - 음식이 명확하지 않은 경우 가장 가능성이 높은 음식으로 추정해주세요
    - 응답은 반드시 유효한 JSON 형태여야 합니다
    `;

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

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // JSON 파싱 (마크다운 코드 블록 제거)
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } else {
        throw new Error('유효한 JSON 응답을 받지 못했습니다.');
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