<template>
    <div class="share-page">
        <!-- 顶部导航栏 -->
        <van-nav-bar class="nav-bar" safe-area-inset-top fixed>
            <template #left>
                <van-icon name="arrow-left" size="20" class="back-icon" @click="router.back()" />
            </template>

            <template #title>
                <div class="page-title">互填问卷</div>
            </template>

            <template #right>
                <van-icon name="search" size="20" class="search-icon" @click="showSearch = true" />
            </template>
        </van-nav-bar>

        <!-- 搜索框 -->
        <van-search v-model="searchValue" shape="round" placeholder="搜索问卷" v-if="showSearch" class="search-box"
            autofocus @blur="closeSearch" />

        <!-- 筛选标签 -->
        <div class="filter-tabs">
            <van-tabs v-model:active="activeFilter" swipeable shrink title-active-color="#1989fa">
                <van-tab title="全部问卷"></van-tab>
                <van-tab title="未互填"></van-tab>
                <van-tab title="互填中"></van-tab>
                <van-tab title="已完成"></van-tab>
            </van-tabs>
        </div>

        <!-- 问卷列表 -->
        <div class="share-list">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
                <van-loading type="spinner" size="24px" vertical>加载中...</van-loading>
            </div>

            <div v-for="survey in filteredSurveys" :key="survey.id" class="share-card">
                <!-- 问卷基本信息 -->
                <div class="card-header">
                    <div class="survey-title">{{ survey.title }}</div>
                    <div :class="statusClass(survey.status)">{{ getStatusText(survey.status) }}</div>
                </div>

                <div class="survey-content">
                    <div class="survey-info">
                        <div class="create-time">
                            <van-icon name="underway" />
                            <span>{{ formatDate(survey.createdAt) }}</span>
                        </div>
                        <div class="participants">
                            <van-icon name="friends" />
                            <span>已参与: {{ survey.collectedResponses }}/{{ survey.expectedResponses }}</span>
                        </div>
                    </div>

                    <!-- 互助信息 -->
                    <div class="share-info">
                        <div class="mutual-count">
                            <van-icon name="exchange" color="#1989fa" />
                            <span class="count">{{ survey.mutualCount }}</span>
                            <span>次互助</span>
                        </div>

                        <div class="exchange-button">
                            <van-button v-if="survey.status === 'draft' || survey.status === 'published'" type="primary"
                                size="small" @click="exchangeSurvey(survey.id)" round :loading="submitting[survey.id]"
                                :disabled="submitting[survey.id]">
                                立即互填
                            </van-button>

                            <van-button v-if="survey.status === 'closed' || survey.status === 'archived'" plain
                                size="small" @click="viewExchange(survey.id)" round>
                                查看互助
                            </van-button>
                        </div>
                    </div>
                </div>

                <!-- 问卷操作区 -->
                <div class="card-actions">
                    <van-button plain size="small" @click="previewSurvey(survey.id)" class="action-btn">
                        预览问卷
                    </van-button>

                    <van-button plain size="small" @click="editSurvey(survey.id)" class="action-btn">
                        编辑问卷
                    </van-button>

                    <van-button plain size="small" @click="removeSurvey(survey.id)" class="action-btn">
                        <van-icon name="delete" />删除
                    </van-button>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="!loading && filteredSurveys.length === 0" class="empty-state">
                <van-icon name="description" class="empty-icon" />
                <div class="empty-text">暂无问卷可互填</div>
                <div class="empty-tip">创建问卷并发布到互填区即可寻找互助</div>
                <van-button type="primary" round class="create-btn" @click="createSurvey">
                    <van-icon name="plus" />创建新问卷
                </van-button>
            </div>
        </div>

        <!-- 填写问卷弹窗 -->
        <van-dialog v-model:show="showAnswerDialog" title="填写问卷" show-cancel-button @confirm="submitSurvey"
            @cancel="closeAnswerDialog" :close-on-click-overlay="false">
            <div class="answer-dialog-content">
                <!-- 问卷预览 -->
                <div v-if="surveyToAnswer" class="preview-section">
                    <div class="dialog-title">{{ surveyToAnswer.title }}</div>
                    <div class="dialog-description">{{ surveyToAnswer.description }}</div>

                    <!-- 题目列表 -->
                    <div v-for="(question, qIndex) in surveyToAnswer.questions" :key="qIndex" class="question-item">
                        <div class="question-title">
                            {{ qIndex + 1 }}. {{ question.title }}
                            <span v-if="question.required" class="required-star">*</span>
                        </div>

                        <!-- 单选题 -->
                        <van-radio-group v-model="answers[question.id]" v-if="question.type === 'single_choice'">
                            <van-radio v-for="option in question.options" :key="option.id" :name="option.id"
                                icon-size="18px" class="option-item">
                                {{ option.text }}
                            </van-radio>
                        </van-radio-group>

                        <!-- 多选题 -->
                        <van-checkbox-group v-model="answers[question.id]" v-if="question.type === 'multiple_choice'">
                            <van-checkbox v-for="option in question.options" :key="option.id" :name="option.id"
                                shape="square" class="option-item">
                                {{ option.text }}
                            </van-checkbox>
                        </van-checkbox-group>

                        <!-- 文本题 -->
                        <van-field v-if="question.type === 'text'" v-model="answers[question.id]" type="textarea"
                            placeholder="请输入您的答案" rows="2" autosize :maxlength="1000" show-word-limit />

                        <!-- 评分题 -->
                        <div v-if="question.type === 'rating'" class="rating-question">
                            <van-rate v-model="answers[question.id]" :count="5" color="#1989fa" void-color="#e8e8e8"
                                :size="22" />
                            <div class="rating-labels">
                                <span>非常不满意</span>
                                <span>非常满意</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 加载状态 -->
                <div v-else class="dialog-loading">
                    <van-loading type="spinner" size="24px">加载问卷中...</van-loading>
                </div>
            </div>
        </van-dialog>

        <!-- 底部按钮 -->
        <div class="footer-action">
            <van-button type="primary" block class="publish-btn" @click="createSurvey">
                <van-icon name="plus" />发布问卷到互填区
            </van-button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { showSuccessToast, showFailToast, showToast } from 'vant'

// 模拟API调用
const mockApi = {
    // 获取问卷列表
    getSurveys: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 's1',
                        title: '大学生消费习惯调研',
                        createdAt: '2023-10-15T14:30:00',
                        status: 'published', // 使用标准状态
                        collectedResponses: 42,
                        expectedResponses: 100,
                        mutualCount: 0,
                        creatorId: 'u1'
                    },
                    {
                        id: 's2',
                        title: '城市通勤时间满意度调查',
                        createdAt: '2023-10-18T09:15:00',
                        status: 'published',
                        collectedResponses: 15,
                        expectedResponses: 50,
                        mutualCount: 4,
                        creatorId: 'u1'
                    },
                    {
                        id: 's3',
                        title: '短视频APP使用习惯研究',
                        createdAt: '2023-10-22T16:45:00',
                        status: 'closed',
                        collectedResponses: 75,
                        expectedResponses: 80,
                        mutualCount: 8,
                        creatorId: 'u1'
                    }
                ])
            }, 800)
        })
    },

    // 获取单个问卷预览
    getSurveyPreview: (surveyId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const surveys = {
                    s1: {
                        id: 's1',
                        title: '大学生消费习惯调研',
                        description: '本问卷旨在了解当代大学生的消费习惯和消费观念，为相关研究提供数据支持',
                        coverImage: null,
                        createdAt: '2023-10-15T14:30:00',
                        questions: [
                            {
                                id: 'q1',
                                type: 'multiple_choice',
                                title: '您每月的生活费大约是多少？',
                                required: true,
                                options: [
                                    { id: 'o1', text: '1000元以下' },
                                    { id: 'o2', text: '1000-2000元' },
                                    { id: 'o3', text: '2000-3000元' },
                                    { id: 'o4', text: '3000元以上' }
                                ]
                            },
                            {
                                id: 'q2',
                                type: 'single_choice',
                                title: '您主要的消费类型是？',
                                required: true,
                                options: [
                                    { id: 'o5', text: '餐饮饮食' },
                                    { id: 'o6', text: '服饰美容' },
                                    { id: 'o7', text: '学习资料' },
                                    { id: 'o8', text: '社交娱乐' },
                                    { id: 'o9', text: '电子产品' }
                                ]
                            },
                            {
                                id: 'q3',
                                type: 'rating',
                                title: '您对目前的消费状况满意程度如何？',
                                required: true
                            },
                            {
                                id: 'q4',
                                type: 'text',
                                title: '请简单描述您对理性消费的看法：',
                                required: false
                            }
                        ]
                    },
                    s2: {
                        id: 's2',
                        title: '城市通勤时间满意度调查',
                        description: '本调查旨在了解城市居民的通勤状况，作为城市规划的参考依据',
                        coverImage: null,
                        createdAt: '2023-10-18T09:15:00',
                        questions: [
                            {
                                id: 'q5',
                                type: 'single_choice',
                                title: '您每天的上下班通勤时间大约是多少？',
                                required: true,
                                options: [
                                    { id: 'o10', text: '30分钟以内' },
                                    { id: 'o11', text: '30分钟-1小时' },
                                    { id: 'o12', text: '1-1.5小时' },
                                    { id: 'o13', text: '1.5-2小时' },
                                    { id: 'o14', text: '2小时以上' }
                                ]
                            },
                            {
                                id: 'q6',
                                type: 'rating',
                                title: '您对当前的交通状况满意吗？',
                                required: true
                            }
                        ]
                    }
                }

                resolve(surveys[surveyId] || null)
            }, 500)
        })
    },

    // 提交问卷
    submitSurvey: (surveyId, answers) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 模拟验证必填问题
                const survey = {
                    s1: {
                        requiredQuestions: ['q1', 'q2', 'q3']
                    },
                    s2: {
                        requiredQuestions: ['q5', 'q6']
                    }
                }

                const requiredQuestions = survey[surveyId]?.requiredQuestions || []
                const hasMissing = requiredQuestions.some(q => !answers[q])

                if (hasMissing) {
                    reject('请完成所有必填问题')
                } else {
                    resolve({ success: true, surveyId })
                }
            }, 1000)
        })
    }
}

const router = useRouter()
const showSearch = ref(false)
const searchValue = ref('')
const activeFilter = ref(0) // 筛选标签的当前值
const loading = ref(true)
const surveys = ref([])
const showAnswerDialog = ref(false)
const surveyToAnswer = ref(null)
const answers = ref({})
const submitting = ref({}) // 各问卷提交状态
const currentSurveyId = ref('')

// 初始化数据
const initData = async () => {
    loading.value = true
    try {
        const data = await mockApi.getSurveys()
        surveys.value = data
    } catch (error) {
        showFailToast('加载问卷失败: ' + error.message)
    } finally {
        loading.value = false
    }
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        draft: '草稿',
        published: '未互填',
        closed: '已完成',
        archived: '已归档'
    }
    return statusMap[status] || status
}

// 格式化日期
const formatDate = (date) => {
    return dayjs(date).format('YYYY/MM/DD HH:mm')
}

// 状态样式类
const statusClass = (status) => {
    const baseClass = 'survey-status'
    const statusClassMap = {
        draft: `${baseClass} status-draft`,
        published: `${baseClass} status-available`,
        closed: `${baseClass} status-completed`,
        archived: `${baseClass} status-completed`
    }
    return statusClassMap[status] || baseClass
}

// 过滤问卷数据
const filteredSurveys = computed(() => {
    let result = [...surveys.value]

    // 根据搜索关键词过滤
    if (searchValue.value) {
        const keyword = searchValue.value.toLowerCase()
        result = result.filter(survey =>
            survey.title.toLowerCase().includes(keyword)
        )
    }

    // 根据活动标签过滤
    switch (activeFilter.value) {
        case 1: // 未互填（published）
            result = result.filter(survey => survey.status === 'published')
            break
        case 2: // 互填中（暂无对应状态，使用published）
            result = result.filter(survey => survey.status === 'published')
            break
        case 3: // 已完成（closed）
            result = result.filter(survey => survey.status === 'closed')
            break
    }

    return result
})

// 关闭搜索
const closeSearch = () => {
    if (!searchValue.value) {
        showSearch.value = false
    }
}

// 互填问卷（打开填写弹窗）
const exchangeSurvey = async (surveyId) => {
    currentSurveyId.value = surveyId
    showAnswerDialog.value = true
    answers.value = {}

    try {
        showToast({ message: '加载问卷中...', duration: 0, forbidClick: true })
        const survey = await mockApi.getSurveyPreview(surveyId)
        surveyToAnswer.value = survey

        // 初始化答案对象
        survey.questions.forEach(question => {
            if (question.type === 'multiple_choice') {
                answers.value[question.id] = []
            } else {
                answers.value[question.id] = ''
            }
        })
    } catch (error) {
        showFailToast('加载问卷失败: ' + error.message)
        closeAnswerDialog()
    } finally {
        showToast.clear()
    }
}

// 关闭填写弹窗
const closeAnswerDialog = () => {
    showAnswerDialog.value = false
    surveyToAnswer.value = null
    answers.value = {}
    currentSurveyId.value = ''
}

// 提交问卷
const submitSurvey = async () => {
    const surveyId = currentSurveyId.value
    if (!surveyId || !surveyToAnswer.value) return

    // 设置提交状态
    submitting.value[surveyId] = true

    try {
        await mockApi.submitSurvey(surveyId, answers.value)
        showSuccessToast('问卷提交成功！')

        // 更新问卷状态（实际应用中应由API返回新状态）
        const surveyIndex = surveys.value.findIndex(s => s.id === surveyId)
        if (surveyIndex !== -1) {
            surveys.value[surveyIndex].collectedResponses += 1
        }

        closeAnswerDialog()
    } catch (error) {
        showFailToast(error || '提交失败，请稍后再试')
    } finally {
        submitting.value[surveyId] = false
    }
}

// 查看互助详情
const viewExchange = (id) => {
    console.log(`查看互助详情：${id}`)
    router.push({ name: 'ExchangeDetail', params: { id } })
}

// 预览问卷
const previewSurvey = (id) => {
    console.log(`预览问卷：${id}`)
    router.push({ name: 'SurveyPreview', params: { id } })
}

// 编辑问卷
const editSurvey = (id) => {
    console.log(`编辑问卷：${id}`)
    router.push({ name: 'SurveyEditor', params: { id } })
}

// 删除问卷
const removeSurvey = async (id) => {
    try {
        // 在实际应用中这里会调用删除API
        await new Promise(resolve => setTimeout(resolve, 500))

        surveys.value = surveys.value.filter(survey => survey.id !== id)
        showSuccessToast('问卷删除成功')
    } catch (error) {
        showFailToast('删除失败: ' + error.message)
    }
}

// 创建新问卷
const createSurvey = () => {
    router.push({ name: 'CreateQuestionnaire' })
}

onMounted(() => {
    initData()
})
</script>

<style scoped>
.share-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    overflow: auto;
    padding-bottom: 70px;
}

.nav-bar {
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-tabs {
    margin-top: 46px;
    background-color: #fff;
    position: sticky;
    top: 46px;
    z-index: 90;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.share-list {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: calc(100vh - 180px);
}

.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
}

.share-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 16px;
    transition: all 0.3s;
}

.share-card:hover {
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

.status-draft {
    background-color: #f0f0f0;
    color: #666;
}

.status-available {
    background-color: #e6f7ff;
    color: #1890ff;
}

.status-completed {
    background-color: #f6ffed;
    color: #52c41a;
}

.survey-content {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 12px;
}

.survey-info {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 15px;
    font-size: 14px;
    color: #666;
}

.create-time,
.participants {
    display: flex;
    align-items: center;
}

.van-icon {
    margin-right: 5px;
    font-size: 16px;
}

.share-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 8px;
    background-color: #f8fbff;
    border-radius: 12px;
    margin-top: 10px;
}

.mutual-count {
    display: flex;
    align-items: center;
    font-size: 15px;
    color: #333;
}

.mutual-count .count {
    color: #1989fa;
    font-weight: 700;
    margin: 0 4px;
}

.exchange-button .van-button {
    height: 32px;
    padding: 0 16px;
    font-weight: 500;
}

.card-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.action-btn {
    border-radius: 16px;
    font-size: 13px;
    height: 32px;
    padding: 0 14px;
    display: flex;
    align-items: center;
}

.empty-state {
    margin-top: 30px;
    text-align: center;
    padding: 30px 0;
}

.empty-icon {
    font-size: 80px;
    color: #e0e4e9;
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

.create-btn .van-icon {
    font-size: 18px;
    margin-right: 6px;
}

.footer-action {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.publish-btn {
    height: 48px;
    border-radius: 24px;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.publish-btn .van-icon {
    font-size: 20px;
    margin-right: 6px;
}

/* 填写问卷弹窗样式 */
.answer-dialog-content {
    padding: 20px 16px;
    max-height: 70vh;
    overflow-y: auto;
}

.dialog-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #333;
}

.dialog-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.question-item {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f5f5f5;
}

.question-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
    color: #333;
}

.required-star {
    color: #ee0a24;
    margin-left: 4px;
    vertical-align: middle;
}

.option-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    font-size: 15px;
}

.rating-question {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.rating-labels {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 8px;
    font-size: 12px;
    color: #999;
}

.dialog-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}
</style>