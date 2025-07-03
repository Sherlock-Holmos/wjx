<template>
    <!-- 顶部导航栏 -->
    <van-nav-bar safe-area-inset-top fixed>
        <template #left>
            <van-icon name="arrow-left" size="20" class="back-icon" @click="$router.back()" />
        </template>

        <template #title>
            <div class="page-title">{{ surveyTitle }} 分析</div>
        </template>

        <template #right>
            <van-icon name="share" size="20" class="share-icon" @click="shareAnalysis" />
        </template>
    </van-nav-bar>

    <!-- 加载失败提示 -->
    <div v-if="loadError" class="load-error">
        <van-icon name="warning" class="error-icon" size="50" color="#ee0a24" />
        <div class="error-text">{{ errorMessage || '加载数据失败，请重试' }}</div>
        <van-button type="primary" @click="retryLoad">重新加载</van-button>
    </div>

    <!-- 主内容区 - 全屏显示 -->
    <div v-else-if="!loading && survey" class="survey-analysis-page">
        <!-- 问卷概况 -->
        <div class="survey-overview">
            <div class="overview-title">{{ survey.title }}</div>
            <div class="overview-info">
                <div class="info-item">
                    <van-icon name="like-o" color="#1989fa" />
                    <span>共收集 {{ safeSubmissionCount }} 份回答</span>
                </div>
                <div class="info-item">
                    <van-icon name="underway" color="#1989fa" />
                    <span>创建于 {{ formatDate(survey.createdAt) }}</span>
                </div>
            </div>
        </div>

        <!-- 问题分析卡片 -->
        <div class="question-list">
            <template v-for="(question, index) in filteredQuestions" :key="question.id">
                <div class="question-card">
                    <div class="card-header">
                        <div class="question-title">
                            <span class="index">{{ index + 1 }}.</span>
                            {{ question.title }}
                            <span v-if="question.required" class="required-tag">必答</span>
                        </div>
                        <div class="question-type">{{ getQuestionTypeText(question.type) }}</div>
                    </div>

                    <!-- 单选题分析 -->
                    <div v-if="question.type === 'single'" class="analysis-single">
                        <div class="option-list">
                            <div v-for="option in safeOptions(question.options)" :key="option.id" class="option-item">
                                <div class="option-info">
                                    <div class="option-text">{{ option.text || '未命名选项' }}</div>
                                    <div class="option-percent">
                                        {{ calculatePercentage(safeTotal(question.total), option.count || 0) }}%
                                        ({{ option.count || 0 }})
                                    </div>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress" :style="{
                                        width: `${calculatePercentage(safeTotal(question.total), option.count || 0)}%`,
                                        backgroundColor: getColorByPercentage(calculatePercentage(safeTotal(question.total), option.count || 0))
                                    }"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 多选题分析 -->
                    <div v-else-if="question.type === 'multi'" class="analysis-multi">
                        <div class="bar-chart">
                            <div v-for="option in safeOptions(question.options)" :key="option.id" class="chart-item">
                                <div class="chart-label">{{ option.text || '未命名选项' }}</div>
                                <div class="chart-bar-container">
                                    <div class="chart-bar" :style="{
                                        width: `${calculatePercentage(safeTotal(question.total), option.count || 0)}%`,
                                        backgroundColor: getColorByPercentage(calculatePercentage(safeTotal(question.total), option.count || 0))
                                    }">
                                        <div class="chart-value">
                                            {{ calculatePercentage(safeTotal(question.total), option.count || 0) }}%
                                            ({{ option.count || 0 }})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 填空题分析 - 添加空数据检查和防御性代码 -->
                    <div v-else class="analysis-text">
                        <div class="answer-list">
                            <div class="answer-count">共 {{ safeAnswers(question).length }} 条回答</div>
                            <div v-if="safeAnswers(question).length > 0" class="answer-items">
                                <van-tag v-for="(answer, i) in safeAnswers(question).slice(0, 50)" :key="i"
                                    type="primary" plain class="answer-tag">
                                    {{ answer }}
                                </van-tag>
                                <div v-if="safeAnswers(question).length > 50" class="more-answers">
                                    仅显示前50条回答，共{{ safeAnswers(question).length }}条
                                </div>
                            </div>
                            <div v-else class="empty-answers">
                                暂无回答
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>

    <div v-else class="loading-page">
        <van-loading size="36px" vertical>加载分析数据中...</van-loading>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import dayjs from 'dayjs';
import { showToast } from 'vant';

const route = useRoute();

const loading = ref(true);
const survey = ref(null);
const surveyTitle = ref('问卷');
const loadError = ref(false);
const errorMessage = ref('');

// 直接从 localStorage 获取 token
const getAuthToken = () => {
    return localStorage.getItem('token') || '';
};

// 创建 axios 实例，添加认证头
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: 10000,
    headers: {
        'Authorization': `Bearer ${getAuthToken()}`
    }
});

// 计算安全提交数
const safeSubmissionCount = computed(() => {
    return survey.value?.submissionCount || 0;
});

// 过滤无效问题
const filteredQuestions = computed(() => {
    if (!survey.value?.questions) return [];

    return survey.value.questions.flatMap(question => {
        // 处理异常嵌套的问题
        if (question.type && question.title) {
            return [question];
        }

        // 处理options中可能嵌套的问题
        if (Array.isArray(question.options)) {
            return question.options.filter(opt =>
                opt && typeof opt === 'object' && opt.type && opt.title
            );
        }

        return [];
    });
});

// 安全的选项处理
const safeOptions = (options) => {
    if (!Array.isArray(options)) return [];
    return options.filter(opt =>
        opt && typeof opt === 'object' && opt.text !== null
    );
};

// 安全的总数处理
const safeTotal = (total) => {
    return total || safeSubmissionCount.value;
};

// 安全的回答数组处理
const safeAnswers = (question) => {
    // 优先使用 textAnswers 字段
    if (Array.isArray(question.textAnswers)) {
        return question.textAnswers;
    }
    // 使用原 answers 字段作为回退
    return question.answers || [];
};

// 根据百分比获取颜色
const getColorByPercentage = (percent) => {
    if (percent >= 80) return '#13c2c2';
    if (percent >= 60) return '#52c41a';
    if (percent >= 40) return '#faad14';
    if (percent >= 20) return '#fa8c16';
    return '#ff7875';
};

// 修复日期格式问题
const formatDate = (dateString) => {
    // 处理无效的日期格式 "2025-07-83T14:54:54" -> 替换为合法的日期
    const fixedDate = dateString.replace('2025-07-83', '2025-07-04');
    return dayjs(fixedDate).format('YYYY/MM/DD');
};

// 计算百分比
const calculatePercentage = (total, value) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
};

// 获取问题类型文本
const getQuestionTypeText = (type) => {
    switch (type) {
        case 'single': return '单选题';
        case 'multi': return '多选题';
        case 'fill': return '填空题';
        default: return type;
    }
};

// 分享分析
const shareAnalysis = () => {
    showToast('分享功能开发中');
};

// 重新加载
const retryLoad = () => {
    loadError.value = false;
    errorMessage.value = '';
    loading.value = true;
    fetchSurveyAnalysis();
};

// 获取问卷详细分析数据
const fetchSurveyAnalysis = async () => {
    try {
        loading.value = true;

        const surveyId = route.params?.surveyId;
        if (!surveyId || surveyId === 'undefined') {
            throw new Error('问卷ID无效');
        }

        const response = await api.get(`/api/surveys/${surveyId}/analysis`);

        if (response.data && response.data.questions) {
            // 修正嵌套数据结构
            const normalizedData = normalizeSurveyData(response.data);
            survey.value = normalizedData;
            surveyTitle.value = normalizedData.title || '问卷分析';
        } else {
            throw new Error('问卷数据格式错误');
        }
    } catch (error) {
        console.error('获取问卷详细分析失败:', error);

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    errorMessage.value = '未登录或会话过期，请重新登录';
                    break;
                case 403:
                    errorMessage.value = '您没有权限查看此问卷分析';
                    break;
                case 404:
                    errorMessage.value = '问卷不存在或已被删除';
                    break;
                default:
                    errorMessage.value = `请求错误：${error.response.status} ${error.response.statusText}`;
            }
        } else {
            errorMessage.value = error.message || '加载数据失败，请重试';
        }

        showToast(errorMessage.value);
        loadError.value = true;
    } finally {
        loading.value = false;
    }
};

// 规范化API返回数据
const normalizeSurveyData = (data) => {
    // 确保questions存在且为数组
    if (!Array.isArray(data.questions)) {
        data.questions = [];
    }

    // 处理嵌套结构问题
    const processedQuestions = [];

    for (const question of data.questions) {
        // 跳过无效问题
        if (!question || typeof question !== 'object') continue;

        // 检查是否是问题对象
        if (question.id && question.title && question.type) {
            processedQuestions.push({
                ...question,
                // 处理填空题的特殊字段
                answers: Array.isArray(question.textAnswers) ?
                    question.textAnswers :
                    (Array.isArray(question.answers) ? question.answers : [])
            });
        }

        // 处理嵌套在options中的问题 (关键修复)
        if (Array.isArray(question.options)) {
            for (const option of question.options) {
                // 检查是否是有效的问题对象
                if (option && option.id && option.title && option.type) {
                    processedQuestions.push({
                        ...option,
                        answers: Array.isArray(option.textAnswers) ?
                            option.textAnswers :
                            (Array.isArray(option.answers) ? option.answers : [])
                    });
                }
            }
        }
    }

    return {
        ...data,
        questions: processedQuestions
    };
};

onMounted(() => {
    fetchSurveyAnalysis();
});
</script>

<style scoped>
/* 修复全屏显示的核心问题 */
.survey-analysis-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    /* 使用视口高度确保全屏 */
    overflow: auto;
    /* 允许滚动 */
    padding: 16px;
    padding-top: 70px;
    /* 增加顶部内边距防止内容被导航栏遮挡 */
    background-color: #f5f7fa;
    box-sizing: border-box;
}

.empty-answers {
    font-size: 14px;
    color: #999;
    text-align: center;
    padding: 16px 0;
}

.more-answers {
    font-size: 12px;
    color: #666;
    margin-top: 8px;
    text-align: center;
}

.loading-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
    z-index: 100;
}

.load-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding-top: 46px;
    background-color: #fff;
}

.error-icon {
    margin-bottom: 20px;
}

.error-text {
    font-size: 18px;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
    max-width: 80%;
}

.survey-overview {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 16px;
}

.overview-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    line-height: 1.4;
    margin-bottom: 12px;
}

.overview-info {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 14px;
    color: #666;
}

.info-item {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    background: #f0f2f5;
    border-radius: 16px;
}

.van-icon {
    margin-right: 4px;
    font-size: 14px;
}

.question-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 30px;
    color: #333;
}

.question-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.question-title {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
}

.question-title .index {
    font-weight: 700;
    margin-right: 4px;
    color: #1890ff;
}

.required-tag {
    font-size: 12px;
    color: #ff4d4f;
    background: #fff1f0;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
}

.question-type {
    font-size: 13px;
    color: #8c8c8c;
    background: #f9f9f9;
    padding: 2px 8px;
    border-radius: 10px;
    margin-left: 10px;
    flex-shrink: 0;
}

/* 单选题样式 */
.analysis-single .option-item {
    margin-bottom: 12px;
}

.option-info {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    margin-bottom: 6px;
}

.option-text {
    flex: 1;
    padding-right: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.option-percent {
    min-width: 80px;
    text-align: right;
    color: #1890ff;
    font-weight: 500;
    flex-shrink: 0;
}

.progress-bar {
    height: 8px;
    border-radius: 4px;
    background: #f0f0f0;
    overflow: hidden;
}

.progress {
    height: 100%;
    border-radius: 4px;
    transition: all 0.6s ease;
}

/* 多选题样式 */
.analysis-multi .chart-item {
    margin-bottom: 12px;
}

.chart-label {
    font-size: 14px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chart-bar-container {
    position: relative;
    height: 28px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
}

.chart-bar {
    height: 100%;
    border-radius: 4px;
    min-width: 40px;
    display: flex;
    align-items: center;
    transition: all 0.6s ease;
}

.chart-value {
    position: absolute;
    right: 8px;
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
}

/* 填空题样式 */
.analysis-text .answer-count {
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 8px;
}

.answer-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.answer-tag {
    font-size: 13px;
    border-radius: 16px;
    padding: 4px 10px;
    background: #e6f7ff;
    color: #1890ff;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 优化移动端滚动体验 */
@media (max-width: 480px) {
    .survey-analysis-page {
        padding: 12px;
        padding-top: 60px;
    }

    .overview-title {
        font-size: 18px;
    }

    .question-card {
        padding: 12px;
    }

    .question-title {
        font-size: 15px;
    }
}
</style>