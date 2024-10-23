// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get } from "firebase/database"; // Realtime Database 관련 함수 추가

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAkZvnsdkwpXYSO_T6hng5kvgV6UqQ6fa8",
    authDomain: "qna3-9b45d.firebaseapp.com",
    projectId: "qna3-9b45d",
    storageBucket: "qna3-9b45d.appspot.com",
    messagingSenderId: "598110901932",
    appId: "1:598110901932:web:ac6c44d91be971404ff109",
    measurementId: "G-B9BH0Z7MZ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app); // Realtime Database 초기화

// 질문 제출 이벤트 리스너
document.getElementById('questionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const questionInput = document.getElementById('questionInput');
    const questionText = questionInput.value;

    if (questionText) {
        const questionId = ref(database, 'questions').push().key;

        // 질문을 Firebase에 저장
        set(ref(database, 'questions/' + questionId), {
            question: questionText
        }).then(() => {
            // 질문 목록 업데이트
            loadQuestions();
            questionInput.value = '';
        }).catch((error) => {
            console.error("Error saving question: ", error);
        });
    }
});

// 질문 목록 로드 함수
function loadQuestions() {
    const questionsRef = ref(database, 'questions');
    get(questionsRef).then((snapshot) => {
        const questionsList = document.getElementById('questionsList');
        questionsList.innerHTML = ''; // 기존 질문 목록 초기화
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const question = childSnapshot.val().question;
                const questionDiv = document.createElement('div');
                questionDiv.classList.add('question', 'border', 'rounded', 'p-3');
                questionDiv.textContent = question;

                // 답변 추가 버튼
                const answerButton = document.createElement('button');
                answerButton.textContent = '답변하기';
                answerButton.classList.add('btn', 'btn-secondary', 'ml-2');
                questionDiv.appendChild(answerButton);

                // 답변 입력 필드
                const answerInput = document.createElement('input');
                answerInput.type = 'text';
                answerInput.placeholder = '답변을 입력하세요';
                answerInput.classList.add('form-control', 'mt-2');
                answerInput.style.display = 'none'; // 처음에는 숨김
                questionDiv.appendChild(answerInput);

                // 답변 추가 기능
                answerButton.addEventListener('click', function() {
                    answerInput.style.display = answerInput.style.display === 'none' ? 'block' : 'none';
                    answerButton.textContent = answerButton.textContent === '답변하기' ? '답변 취소' : '답변하기';
                });

                answerInput.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter' && answerInput.value) {
                        const answerDiv = document.createElement('div');
                        answerDiv.classList.add('answer');
                        answerDiv.textContent = answerInput.value;
                        questionDiv.appendChild(answerDiv);
                        
                        // SweetAlert2 알림
                        Swal.fire({
                            icon: 'success',
                            title: '답변이 등록되었습니다!',
                            text: '답변이 성공적으로 추가되었습니다.',
                        });

                        answerInput.value = '';
                        answerInput.style.display = 'none';
                        answerButton.textContent = '답변하기';
                    }
                });

                questionsList.appendChild(questionDiv);
            });
        }
    }).catch((error) => {
        console.error("Error getting questions: ", error);
    });
}

// 페이지 로드 시 질문 목록 불러오기
window.onload = loadQuestions;
