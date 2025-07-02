<template>
    <div class="survey-preview-container">
        <!-- 顶部导航栏 -->
        <van-nav-bar title="问卷预览" left-arrow safe-area-inset-top fixed @click-left="goBack" class="nav-bar" />

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <van-loading size="24px">加载中...</van-loading>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-container">
            <van-empty image="error" description="加载问卷失败">
                <van-button round type="primary" @click="retryLoad">
                    重新加载
                </van-button>
            </van-empty>
        </div>

        <!-- 问卷预览内容 -->
        <div v-if="surveyData" class="preview-scroll-area">
            <div class="preview-content">
                <!-- 封面图 -->
                <div v-if="surveyData.coverImage" class="cover-image">
                    <img :src="surveyData.coverImage" alt="问卷封面" />
                </div>

                <!-- 问卷标题区域 -->
                <div class="preview-header">
                    <h1 class="survey-title">{{ surveyData.title }}</h1>
                    <div class="survey-description">{{ surveyData.description }}</div>
                    <div class="preview-tip">预览模式 • 数据不会被保存</div>
                </div>

                <!-- 问卷问题列表 -->
                <div class="questions-container">
                    <div v-for="(question, index) in surveyData.questions" :key="question.id" class="question-card">
                        <!-- 问题标题 -->
                        <div class="question-header">
                            <div class="question-title">
                                <span class="number">{{ index + 1 }}.</span>
                                {{ question.title }}
                                <span v-if="question.required" class="required">*</span>
                            </div>
                        </div>

                        <!-- 单选题 -->
                        <div v-if="question.type === 'SINGLE_SELECT'" class="options-container">
                            <van-radio-group v-model="questionAnswers[question.id]">
                                <van-cell-group>
                                    <van-cell v-for="option in question.options" :key="option.id" clickable
                                        :title="option.text" @click="questionAnswers[question.id] = option.id">
                                        <template #right-icon>
                                            <van-radio :name="option.id" />
                                        </template>
                                    </van-cell>
                                </van-cell-group>
                            </van-radio-group>
                        </div>

                        <!-- 多选题 -->
                        <div v-if="question.type === 'MULTI_SELECT'" class="options-container">
                            <van-checkbox-group v-model="questionAnswers[question.id]">
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
                        <div v-if="question.type === 'TEXT'" class="text-container">
                            <van-field v-model="questionAnswers[question.id]" rows="3" autosize type="textarea"
                                placeholder="请输入您的回答..." :maxlength="question.maxLength || 500" show-word-limit
                                class="textarea" />
                        </div>

                        <!-- 评分题 -->
                        <div v-if="question.type === 'RATING'" class="rating-container">
                            <van-rate v-model="questionAnswers[question.id]" :count="question.maxRating || 5"
                                :gutter="15" :size="28" color="#1989fa" void-color="#c8c9cc" />
                            <div class="rating-labels">
                                <span>不满意</span>
                                <span>非常满意</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 提交按钮 -->
                <div class="submit-container">
                    <van-button round block type="primary" class="submit-btn" :loading="submitting"
                        @click="showPreviewTip">
                        提交问卷
                    </van-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { showToast } from 'vant';

const route = useRoute();
const router = useRouter();

const surveyId = route.params.id;
const surveyData = ref(null);
const loading = ref(true);
const error = ref(false);
const questionAnswers = ref({});
const submitting = ref(false);

// 创建 axios 实例
const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000,
    withCredentials: true
});

// 加载问卷预览数据
const loadSurveyPreview = async () => {
    try {
        loading.value = true;
        error.value = false;

        const response = await api.get(`/api/surveys/${surveyId}/preview`);

        if (response.data) {
            surveyData.value = response.data;
            // 初始化答案数据结构
            initAnswersStructure();
        }
    } catch (e) {
        console.error('加载问卷失败:', e);
        error.value = true;
        showToast('加载问卷失败，请重试');
    } finally {
        loading.value = false;
    }
};

// 初始化答案数据结构
const initAnswersStructure = () => {
    questionAnswers.value = {};

    if (!surveyData.value?.questions) return;

    surveyData.value.questions.forEach(question => {
        switch (question.type) {
            case 'SINGLE_SELECT':
                questionAnswers.value[question.id] = '';
                break;
            case 'MULTI_SELECT':
                questionAnswers.value[question.id] = [];
                break;
            case 'TEXT':
                questionAnswers.value[question.id] = '';
                break;
            case 'RATING':
                questionAnswers.value[question.id] = 0;
                break;
            default:
                questionAnswers.value[question.id] = null;
        }
    });
};

// 切换复选框状态 (用于多选题)
const toggleCheckbox = (questionId, optionId) => {
    const answers = [...questionAnswers.value[questionId]];
    const index = answers.indexOf(optionId);

    if (index > -1) {
        answers.splice(index, 1);
    } else {
        answers.push(optionId);
    }

    questionAnswers.value[questionId] = answers;
};

// 显示预览模式提示
const showPreviewTip = () => {
    submitting.value = true;
    showToast({
        message: '预览模式下提交不会保存数据',
        position: 'bottom',
        duration: 2000,
        onClose: () => {
            submitting.value = false;
        }
    });
};

// 返回上一页
const goBack = () => {
    router.go(-1);
};

// 重试加载
const retryLoad = () => {
    loadSurveyPreview();
};

onMounted(() => {
    loadSurveyPreview();
});
</script>

<style scoped>
.survey-preview-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
    display: flex;
    flex-direction: column;
}

.nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: #fff;
}

.loading-container,
.error-container {
    height: calc(100vh - 46px);
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f9f9f9;
}

.preview-scroll-area {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-top: 46px;
    /* 导航栏高度 */
    padding-bottom: 20px;
    box-sizing: border-box;
}

.preview-content {
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

.preview-header {
    background-color: #fff;
    padding: 20px 16px;
    margin: 20px 0;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.survey-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
    text-align: center;
}

.survey-description {
    font-size: 15px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
    text-align: center;
}

.preview-tip {
    font-size: 13px;
    color: #999;
    text-align: center;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
    margin-top: 12px;
}

.questions-container {
    padding: 0 5px;
}

.question-card {
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.question-card:active {
    transform: translateY(2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.question-header {
    margin-bottom: 16px;
}

.question-title {
    font-size: 17px;
    color: #333;
    font-weight: 500;
    line-height: 1.5;
}

.question-title .number {
    font-weight: bold;
    margin-right: 4px;
}

.required {
    color: #ff4d4f;
    margin-left: 4px;
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
    color: #999;
    padding: 0 10px;
}

.submit-container {
    padding: 0 16px 30px;
    margin-top: 20px;
}

.submit-btn {
    font-size: 18px;
    height: 54px;
    font-weight: 600;
    margin-top: 20px;
    box-shadow: 0 6px 16px rgba(25, 137, 250, 0.25);
}

/* 安全区域适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
    .preview-scroll-area {
        padding-bottom: calc(20px + env(safe-area-inset-bottom));
    }

    .submit-container {
        padding-bottom: calc(30px + env(safe-area-inset-bottom));
    }
}
</style>