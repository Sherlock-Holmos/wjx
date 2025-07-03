<template>
    <div class="survey-form-container">
        <van-nav-bar :title="surveyData ? surveyData.title : '问卷填写'" left-arrow safe-area-inset-top fixed
            @click-left="goBack" class="nav-bar" />

        <div v-if="loading" class="loading-container">
            <van-loading size="24px">加载中...</van-loading>
        </div>

        <div v-if="error" class="error-container">
            <van-empty image="error" :description="errorMessage">
                <van-button round type="primary" @click="retryLoad">
                    重新加载
                </van-button>
            </van-empty>
        </div>

        <div v-if="surveyData" class="form-scroll-area">
            <div class="form-content">
                <div v-if="surveyData.coverImage" class="cover-image">
                    <img :src="surveyData.coverImage" alt="问卷封面" />
                </div>

                <div class="form-header">
                    <h1 class="survey-title">{{ surveyData.title }}</h1>
                    <div class="survey-description">{{ surveyData.description }}</div>
                    <div class="question-count">共 {{ surveyData.questions.length }} 个问题</div>
                </div>

                <div class="questions-container">
                    <div v-for="(question, index) in surveyData.questions" :key="question.id" class="question-card"
                        :class="{ 'has-error': errors[question.id] }" :data-id="question.id">
                        <div class="question-header">
                            <div class="question-title">
                                <span class="number">{{ index + 1 }}.</span>
                                {{ question.title }}
                                <span v-if="question.required" class="required">*</span>
                            </div>

                            <div v-if="errors[question.id]" class="error-tip">
                                <van-icon name="warning" /> {{ errors[question.id] }}
                            </div>
                        </div>

                        <!-- 单选题 -->
                        <div v-if="question.type === 'single'" class="options-container">
                            <van-radio-group v-model="answers[question.id]">
                                <van-cell-group>
                                    <van-cell v-for="option in question.options" :key="option.id" clickable
                                        :title="option.text" @click="answers[question.id] = option.id">
                                        <template #right-icon>
                                            <van-radio :name="option.id" />
                                        </template>
                                    </van-cell>
                                </van-cell-group>
                            </van-radio-group>
                        </div>

                        <!-- 多选题 -->
                        <div v-if="question.type === 'muti'" class="options-container">
                            <van-checkbox-group v-model="answers[question.id]">
                                <van-cell-group>
                                    <van-cell v-for="option in question.options" :key="option.id" clickable
                                        :title="option.text" @click="toggleCheckbox(question.id, option.id)">
                                        <template #right-icon>
                                            <van-checkbox :name="option.id" />
                                        </template>
                                    </van-cell>
                                </van-cell-group>
                            </van-checkbox-group>
                        </div>

                        <!-- 文本题 -->
                        <div v-if="question.type === 'fill'" class="text-container">
                            <van-field v-model="answers[question.id]" rows="3" autosize type="textarea"
                                :placeholder="question.placeholder || '请输入您的回答...'"
                                :maxlength="question.maxLength || 500" show-word-limit class="textarea" />
                        </div>

                        <!-- 评分题 -->
                        <div v-if="question.type === 'rating'" class="rating-container">
                            <van-rate v-model="answers[question.id]" :count="question.maxRating || 5" :gutter="15"
                                :size="28" color="#1989fa" void-color="#c8c9cc" @change="rateChange(question.id)" />
                            <div class="rating-labels">
                                <span>不满意</span>
                                <span>非常满意</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="submit-container">
                    <van-button round block type="primary" class="submit-btn" :loading="submitting"
                        :disabled="submitting" @click="validateForm">
                        提交问卷
                    </van-button>
                </div>
            </div>
        </div>

        <!-- 修复：使用正确的布尔值 prop -->
        <van-dialog v-model:show="showSuccessDialog" title="提交成功" :show-confirm-button="false"
            :show-cancel-button="false">
            <div class="success-container">
                <van-icon name="success" size="60" color="#07c160" />
                <p>问卷已成功提交，感谢您的参与！</p>
                <van-button round type="primary" @click="handleSuccess">确认</van-button>
            </div>
        </van-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { showToast, showConfirmDialog } from 'vant';

const route = useRoute();
const router = useRouter();

const surveyId = route.params.id;
const surveyData = ref(null);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('加载问卷失败');
const answers = ref({});
const errors = ref({});
const submitting = ref(false);
const showSuccessDialog = ref(false);

// 创建 axios 实例
const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000,
    withCredentials: true
});

const loadSurveyData = async () => {
    try {
        loading.value = true;
        error.value = false;
        errors.value = {};

        const response = await api.get(`/api/surveys/${surveyId}`);

        if (response.data) {
            surveyData.value = response.data;

            // 确保问题有options数组
            surveyData.value.questions.forEach(question => {
                if (['single', 'muti'].includes(question.type)) {
                    question.options = question.options || [];
                }
            });

            initAnswersStructure();
        } else {
            error.value = true;
            errorMessage.value = '问卷数据为空';
        }
    } catch (e) {
        console.error('加载问卷失败:', e);
        error.value = true;
        errorMessage.value = e.response?.data?.message || '加载问卷失败，请重试';
        showToast(errorMessage.value);
    } finally {
        loading.value = false;
    }
};

const initAnswersStructure = () => {
    answers.value = {};

    surveyData.value.questions.forEach(question => {
        switch (question.type) {
            case 'single':
                answers.value[question.id] = null;
                break;
            case 'muti':
                answers.value[question.id] = [];
                break;
            case 'fill':
                answers.value[question.id] = '';
                break;
            case 'rating':
                answers.value[question.id] = 0;
                break;
            default:
                answers.value[question.id] = null;
        }
    });
};

const toggleCheckbox = (questionId, optionId) => {
    // 确保answers数组已初始化
    if (!Array.isArray(answers.value[questionId])) {
        answers.value[questionId] = [];
    }

    const answer = [...answers.value[questionId]];
    const index = answer.indexOf(optionId);

    if (index > -1) {
        answer.splice(index, 1);
    } else {
        answer.push(optionId);
    }

    answers.value[questionId] = answer;
};

const rateChange = (questionId) => {
    if (answers.value[questionId] > 0 && errors.value[questionId]) {
        delete errors.value[questionId];
    }
};

const validateForm = () => {
    errors.value = {};
    let isValid = true;
    let firstErrorId = null;

    surveyData.value.questions.forEach(question => {
        if (question.required) {
            const value = answers.value[question.id];
            let hasError = false;

            switch (question.type) {
                case 'single':
                    hasError = value === null;
                    break;
                case 'muti':
                    // 确保是多选数组
                    hasError = !Array.isArray(value) || value.length === 0;
                    break;
                case 'fill':
                    hasError = !value || value.trim() === '';
                    break;
                case 'rating':
                    hasError = value === 0;
                    break;
            }

            if (hasError) {
                errors.value[question.id] = getErrorMessage(question.type);
                isValid = false;
                if (!firstErrorId) firstErrorId = question.id;
            }
        }
    });

    if (isValid) {
        submitForm();
    } else if (firstErrorId) {
        scrollToFirstError(firstErrorId);
        showToast('请完善必填项');
    }
};

const getErrorMessage = (type) => {
    const messages = {
        'single': '请选择一项',
        'muti': '请至少选择一项',
        'fill': '请输入内容',
        'rating': '请进行评分'
    };
    return messages[type] || '请完成此项';
};

const scrollToFirstError = (id) => {
    nextTick(() => {
        const errorElement = document.querySelector(`.question-card[data-id="${id}"]`);
        if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
};

const submitForm = async () => {
    try {
        submitting.value = true;

        const submissionData = {
            surveyId: surveyId,
            answers: surveyData.value.questions.map(question => {
                // 处理不同类型的答案格式
                const value = answers.value[question.id];

                if (question.type === 'MULTI_SELECT' && Array.isArray(value)) {
                    return {
                        questionId: question.id,
                        answer: value.join(',') // 选项ID拼接
                    };
                }

                if (question.type === 'RATING') {
                    return {
                        questionId: question.id,
                        answer: value.toString()
                    };
                }

                return {
                    questionId: question.id,
                    answer: value
                };
            })
        };

        const response = await api.post(`/api/surveys/${surveyId}/submit`, submissionData);

        if (response.data) {
            showSuccessDialog.value = true;
        } else {
            showToast('提交失败，请重试');
        }
    } catch (e) {
        console.error('提交失败:', e);
        showToast(e.response?.data?.message || '提交问卷失败，请重试');
    } finally {
        submitting.value = false;
    }
};

const handleSuccess = () => {
    showSuccessDialog.value = false;
    router.push('/');
};

const goBack = () => {
    const hasAnswers = Object.values(answers.value).some(
        v => (Array.isArray(v) && v.length > 0) ||
            (typeof v === 'string' && v.trim() !== '') ||
            (typeof v === 'number' && v !== 0)
    );

    if (hasAnswers) {
        showConfirmDialog({
            title: '退出提示',
            message: '问卷尚未提交，确定要退出吗？',
            confirmButtonText: '退出',
            cancelButtonText: '取消'
        }).then(() => {
            router.go(-1);
        }).catch(() => { });
    } else {
        router.go(-1);
    }
};

const retryLoad = () => {
    loadSurveyData();
};

onMounted(() => {
    loadSurveyData();
});
</script>

<style scoped>
.survey-form-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    display: flex;
    flex-direction: column;
}

.nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.loading-container,
.error-container {
    height: calc(100vh - 46px);
    display: flex;
    justify-content: center;
    align-items: center;
}

.form-scroll-area {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-top: 46px;
    padding-bottom: 20px;
    box-sizing: border-box;
}

.form-content {
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    padding: 0 16px;
    box-sizing: border-box;
}

.cover-image {
    width: 100%;
    height: 180px;
    overflow: hidden;
    border-radius: 12px;
    margin-top: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cover-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.form-header {
    background: linear-gradient(135deg, #3494e6, #ec6ead);
    padding: 24px 20px;
    margin: 20px 0;
    border-radius: 16px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    color: white;
}

.survey-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 12px;
    text-align: center;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.survey-description {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 15px;
    text-align: center;
    opacity: 0.9;
}

.question-count {
    font-size: 14px;
    text-align: center;
    opacity: 0.8;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    margin-top: 12px;
}

.questions-container {
    padding: 0 5px;
}

.question-card {
    background-color: #fff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
}

.question-card.has-error {
    border-left: 4px solid #ff4444;
}

.question-card:active {
    transform: translateY(2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.question-header {
    margin-bottom: 16px;
    position: relative;
}

.question-title {
    font-size: 17px;
    color: #333;
    font-weight: 500;
    line-height: 1.5;
    margin-right: 50px;
}

.question-title .number {
    font-weight: bold;
    margin-right: 4px;
    color: #3494e6;
}

.required {
    color: #ff4d4f;
    margin-left: 4px;
}

.error-tip {
    position: absolute;
    right: 0;
    top: 0;
    background-color: #fff3f3;
    padding: 4px 10px;
    border-radius: 15px;
    font-size: 12px;
    color: #ff4444;
    display: flex;
    align-items: center;
}

.error-tip .van-icon {
    margin-right: 4px;
}

.options-container {
    margin-top: -8px;
}

.text-container {
    background-color: #fafafa;
    border-radius: 12px;
    overflow: hidden;
}

.textarea {
    background-color: #fff;
    border-radius: 8px;
}

.rating-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 0;
}

.rating-labels {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 10px;
    font-size: 13px;
    color: #666;
    padding: 0 10px;
}

.submit-container {
    padding: 0 16px 30px;
    margin-top: 20px;
    position: sticky;
    bottom: 0;
    background: linear-gradient(to top, #f5f7fa 70%, rgba(245, 247, 250, 0));
    padding-top: 20px;
    z-index: 10;
}

.submit-btn {
    font-size: 18px;
    height: 54px;
    font-weight: 600;
    margin-top: 10px;
    box-shadow: 0 6px 16px rgba(25, 137, 250, 0.3);
    border: none;
}

.success-container {
    padding: 30px;
    text-align: center;
}

.success-container p {
    margin: 20px 0;
    font-size: 16px;
    color: #333;
}

/* 安全区域适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
    .form-scroll-area {
        padding-bottom: calc(20px + env(safe-area-inset-bottom));
    }

    .submit-container {
        padding-bottom: calc(30px + env(safe-area-inset-bottom));
    }
}
</style>