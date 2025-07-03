<template>
    <!-- 顶部导航栏 -->
    <van-nav-bar safe-area-inset-top fixed>
        <template #left>
            <van-icon name="arrow-left" size="20" class="back-icon" @click="$router.back()" />
        </template>

        <template #title>
            <div class="page-title">问卷分析</div>
        </template>

        <template #right>
            <van-icon name="search" size="20" class="search-icon" @click="showSearch = true" />
        </template>
    </van-nav-bar>

    <!-- 主内容区 -->
    <div class="analysis-page">
        <!-- 搜索框 -->
        <van-search v-model="searchValue" shape="round" placeholder="搜索问卷" v-if="showSearch" class="search-box"
            autofocus @blur="closeSearch" />

        <!-- 问卷列表 -->
        <div class="survey-list">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
                <van-loading type="spinner" size="24px" vertical>加载中...</van-loading>
            </div>

            <!-- 问卷卡片 -->
            <div v-for="survey in filteredSurveys" :key="survey.id" class="survey-card">
                <div class="card-header">
                    <div class="survey-title">{{ survey.title }}</div>
                    <div :class="statusClass(survey.status)">
                        {{ getStatusText(survey.status) }}
                    </div>
                </div>

                <div class="card-content">
                    <div class="response-info">
                        <div class="info-item">
                            <van-icon name="contact" color="#1989fa" />
                            <span>{{ survey.submissionCount || 0 }} 份回答</span>
                        </div>
                        <div class="info-item">
                            <van-icon name="underway" color="#1989fa" />
                            <span>{{ formatDate(survey.createdAt) }}</span>
                        </div>
                    </div>

                    <!-- 预览图表 -->
                    <div class="stats-preview" v-if="survey.previewStats && survey.previewStats.length">
                        <div class="preview-item" v-for="preview in survey.previewStats" :key="preview.id">
                            <div class="preview-title">{{ preview.title }}</div>
                            <div class="preview-chart" :style="{ height: preview.height }">
                                <div class="chart-bar" v-for="(value, key) in preview.values" :key="key" :style="{
                                    width: `${calculatePercentage(preview.total, value.count)}%`,
                                    backgroundColor: preview.colors[key]
                                }">
                                    <span class="bar-value" v-if="value.count > 0">
                                        {{ calculatePercentage(preview.total, value.count) }}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="card-actions">
                    <van-button plain type="primary" size="small" @click="viewAnalysis(survey.id)" class="view-btn">
                        查看分析
                    </van-button>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="!loading && filteredSurveys.length === 0" class="empty-state">
                <van-icon name="chart-trending-o" class="empty-icon" size="80" color="#e0e4e9" />
                <div class="empty-text">暂无分析数据</div>
                <div class="empty-tip">您发布的问卷将在这里显示分析结果</div>
                <van-button round type="primary" class="create-btn" @click="handleCreateClick">
                    创建问卷
                </van-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import dayjs from 'dayjs';
import { showToast } from 'vant';

const router = useRouter();

// 状态定义
const showSearch = ref(false);
const searchValue = ref('');
const loading = ref(false);
const surveys = ref([]);

// 颜色数组用于图表
const chartColors = [
    '#1890ff', '#52c41a', '#fadb14', '#fa8c16', '#13c2c2',
    '#722ed1', '#eb2f96', '#2f54eb', '#fa541c', '#a0d911'
];

// 创建 axios 实例
const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000,
    withCredentials: true
});

// 从 localStorage 获取用户信息
const getUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
};

// 格式化日期
const formatDate = (dateString) => {
    return dayjs(dateString).format('YYYY/MM/DD HH:mm');
};

// 计算百分比
const calculatePercentage = (total, value) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
};

// 获取状态文本
const getStatusText = (status) => {
    switch (status) {
        case 'PUBLISHED': return '进行中';
        case 'CLOSED': return '已结束';
        case 'DRAFT': return '草稿';
        case 'ARCHIVED': return '已归档';
        default: return status;
    }
};

// 问卷状态对应的样式类
const statusClass = (status) => {
    const baseClass = 'survey-status';
    switch (status) {
        case 'PUBLISHED': return `${baseClass} status-published`;
        case 'CLOSED': return `${baseClass} status-closed`;
        case 'DRAFT': return `${baseClass} status-draft`;
        case 'ARCHIVED': return `${baseClass} status-archived`;
        default: return baseClass;
    }
};

// 关闭搜索
const closeSearch = () => {
    if (!searchValue.value) {
        showSearch.value = false;
    }
};

// 查看问卷分析详情
const viewAnalysis = (surveyId) => {
    router.push({
        name: 'SurveyAnalysis',
        params: { surveyId: surveyId }
    });
};

// 创建问卷
const handleCreateClick = () => {
    router.push({ name: 'CreateQuestionnaire' });
};

// 过滤问卷列表
const filteredSurveys = computed(() => {
    let result = [...surveys.value];

    // 根据关键词筛选
    if (searchValue.value) {
        const keyword = searchValue.value.toLowerCase();
        result = result.filter(survey =>
            survey.title.toLowerCase().includes(keyword)
        );
    }

    return result;
});

// 为问卷生成预览统计图表数据
const generatePreviewStats = (survey) => {
    if (!survey.questions || !survey.submissionCount || survey.submissionCount === 0) {
        return [];
    }

    // 获取前两个选择题（单选或多选）
    const questionStats = [];
    let count = 0;

    for (const question of survey.questions) {
        if (question.type === 'single' || question.type === 'multi') {
            // 统计每个选项的选择次数
            const stats = [];
            let total = 0;

            question.options.forEach(option => {
                const count = survey.optionStats?.[question.id]?.[option.id] || 0;
                stats.push({
                    id: option.id,
                    text: option.text,
                    count
                });
                total += count;
            });

            if (stats.length > 0) {
                questionStats.push({
                    id: question.id,
                    title: question.title,
                    values: stats,
                    total,
                    height: '30px'
                });

                if (++count >= 2) break; // 最多显示两个图表
            }
        }
    }

    return questionStats;
};

// 获取用户问卷分析数据
const fetchAnalysisSurveys = async () => {
    try {
        loading.value = true;

        const user = getUser();
        if (!user || !user.id) {
            router.push({ name: 'LoginPage' });
            return;
        }

        // 调用新的分卷分析列表接口
        const response = await api.get('/api/surveys/analysis-list', {
            params: {
                userId: user.id
            }
        });

        if (response.data && Array.isArray(response.data)) {
            // 转换数据格式并添加预览数据
            surveys.value = response.data.map(survey => ({
                ...survey,
                // 添加预览图表数据
                previewStats: generatePreviewStats(survey)
            }));

            showToast('数据加载成功');
        }
    } catch (error) {
        console.error('获取问卷分析数据失败:', error);
        showToast('加载数据失败，请重试');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchAnalysisSurveys();
});
</script>

<style scoped>
.analysis-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    overflow: auto;
    padding-top: 46px;
}

.nav-bar {
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.search-box {
    background-color: #fff;
    padding: 8px 16px;
    position: fixed;
    top: 46px;
    left: 0;
    right: 0;
    z-index: 99;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.survey-list {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: calc(100vh - 80px);
}

.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
}

.survey-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 16px;
    transition: all 0.3s;
}

.survey-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.survey-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    line-height: 1.4;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.survey-status {
    font-size: 13px;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 500;
    margin-left: 10px;
    flex-shrink: 0;
}

.status-published {
    background-color: #e6f7ff;
    color: #1890ff;
}

.status-closed {
    background-color: #f0fff4;
    color: #52c41a;
}

.status-draft {
    background-color: #f8f8f8;
    color: #969799;
}

.status-archived {
    background-color: #f0f0f0;
    color: #666;
}

.card-content {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 12px;
}

.response-info {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 15px;
    font-size: 14px;
    color: #666;
}

.info-item {
    display: flex;
    align-items: center;
}

.van-icon {
    margin-right: 6px;
    font-size: 16px;
}

.stats-preview {
    margin-bottom: 16px;
}

.preview-item {
    margin-bottom: 12px;
}

.preview-title {
    font-size: 13px;
    color: #969799;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.preview-chart {
    display: flex;
    align-items: center;
    height: 30px;
    border-radius: 6px;
    overflow: hidden;
    background-color: #f7f8fa;
}

.chart-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-width: 30px;
    transition: width 0.5s ease;
}

.bar-value {
    color: white;
    font-size: 12px;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    position: absolute;
    right: 5px;
}

.card-actions {
    display: flex;
    justify-content: flex-end;
}

.view-btn {
    border-radius: 20px;
    font-weight: 500;
    height: 36px;
    padding: 0 20px;
}

.empty-state {
    margin-top: 40px;
    text-align: center;
    padding: 30px 0;
}

.empty-icon {
    font-size: 80px;
    margin-bottom: 15px;
}

.empty-text {
    font-size: 18px;
    color: #333;
    font-weight: 500;
    margin-bottom: 10px;
}

.empty-tip {
    font-size: 14px;
    color: #999;
    margin-bottom: 20px;
}

.create-btn {
    height: 44px;
    padding: 0 28px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
}
</style>