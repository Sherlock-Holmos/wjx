<template>
    <van-popup v-model:show="visible" position="bottom" round :style="{ height: '100%' }">
        <div class="question-editor">
            <!-- 编辑器头部 -->
            <div class="editor-header">
                <div class="editor-title">
                    <span>{{ question.typeName }}题目编辑</span>
                </div>
                <div class="editor-actions">
                    <van-button icon="cross" type="default" size="small" @click="closeEditor" />
                </div>
            </div>

            <!-- 编辑器主体 -->
            <div class="editor-body">
                <!-- 题目内容编辑 -->
                <div class="editor-section">
                    <div class="section-title">题目</div>
                    <div class="content-editor">
                        <van-field v-model="question.title" placeholder="请输入题目内容" rows="2" autosize type="textarea" />
                        <div class="format-tools">
                            <van-icon name="bold" />
                            <van-icon name="underlined" />
                            <van-icon name="italic" />
                            <van-icon name="photo" />
                        </div>
                    </div>
                </div>

                <!-- 选项编辑区域（单选题、多选题） -->
                <div v-if="hasOptions" class="editor-section">
                    <div class="section-header">
                        <div class="section-title">选项</div>
                        <div class="section-actions">
                            <van-button size="small" type="primary" plain icon="plus"
                                @click="addOption">添加选项</van-button>
                            <van-button size="small" type="default" icon="cluster">批量添加</van-button>
                        </div>
                    </div>

                    <div class="options-list">
                        <div v-for="(option, index) in question.options" :key="option.id" class="option-item">
                            <div class="option-number">{{ getOptionPrefix(index) }}.</div>
                            <van-field v-model="option.text" placeholder="请输入选项内容" class="option-input" />
                            <div class="option-actions">
                                <van-icon name="copy" size="16" @click="copyOption(index)" />
                                <van-icon name="delete" size="16" @click="deleteOption(index)" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 设置区域 -->
                <div class="editor-section">
                    <div class="section-title">设置</div>
                    <div class="settings">
                        <van-cell center :title="multiSwitchText">
                            <template #right-icon>
                                <van-switch v-model="isMultiChoice" size="24" @change="toggleQuestionType" />
                            </template>
                        </van-cell>

                        <van-cell center title="此题目必须回答">
                            <template #right-icon>
                                <van-switch v-model="question.required" size="24" />
                            </template>
                        </van-cell>

                        <van-cell center title="一行显示选项数">
                            <template #right-icon>
                                <van-dropdown-menu active-color="#1989fa">
                                    <van-dropdown-item v-model="rowOptionCount" :options="[
                                        { text: '1个', value: 1 },
                                        { text: '2个', value: 2 },
                                        { text: '3个', value: 3 },
                                        { text: '4个', value: 4 }
                                    ]" />
                                </van-dropdown-menu>
                            </template>
                        </van-cell>
                    </div>
                </div>
            </div>

            <!-- 编辑器底部操作按钮 -->
            <div class="editor-footer">
                <van-button type="default" size="large" @click="closeEditor">返回</van-button>
                <van-button type="primary" size="large" @click="saveQuestion">确认</van-button>
            </div>
        </div>

        <!-- 删除确认弹窗 -->
        <van-dialog v-model:show="showDeleteConfirm" show-cancel-button>
            <div class="delete-confirm">
                <van-icon name="warning" size="36" color="#f44" />
                <p>是否确认删除此选项?</p>
            </div>
        </van-dialog>
    </van-popup>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';

const props = defineProps({
    question: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['save', 'close']);

// 响应式数据
const visible = ref(true);
const showDeleteConfirm = ref(false);
const rowOptionCount = ref(1);
const optionToDelete = ref(null);
const editedQuestion = reactive({ ...props.question });
const isMultiChoice = ref(editedQuestion.type === 'multi');

// 计算属性
const hasOptions = computed(() => {
    return ['single', 'multi', 'dropdown', 'gender'].includes(editedQuestion.type);
});

const multiSwitchText = computed(() => {
    return isMultiChoice.value ? '已切换至多选题' : '切换至多选题';
});

// 方法
const getOptionPrefix = (index) => {
    if (editedQuestion.type === 'gender') return ['男', '女'][index] || '';
    return String.fromCharCode(65 + index);
};

const addOption = () => {
    if (!editedQuestion.options) editedQuestion.options = [];

    const newId = editedQuestion.options.length > 0
        ? Math.max(...editedQuestion.options.map(o => o.id)) + 1
        : 1;

    editedQuestion.options.push({
        id: newId,
        text: `选项${String.fromCharCode(65 + editedQuestion.options.length)}`
    });
};

const copyOption = (index) => {
    if (!editedQuestion.options) return;

    const option = { ...editedQuestion.options[index] };
    option.id = editedQuestion.options.length > 0
        ? Math.max(...editedQuestion.options.map(o => o.id)) + 1
        : 1;

    editedQuestion.options.splice(index + 1, 0, option);
};

const confirmDelete = (index) => {
    optionToDelete.value = index;
    showDeleteConfirm.value = true;
};

const deleteOption = (index) => {
    if (editedQuestion.options && editedQuestion.options.length > 1) {
        editedQuestion.options.splice(index, 1);
    }
};

const toggleQuestionType = () => {
    editedQuestion.type = isMultiChoice.value ? 'multi' : 'single';
    editedQuestion.typeName = isMultiChoice.value ? '多选题' : '单选题';
};

const saveQuestion = () => {
    emit('save', editedQuestion);
};

const closeEditor = () => {
    emit('close');
};

// 监听确认删除弹窗
watch(showDeleteConfirm, (newVal) => {
    if (!newVal && optionToDelete.value !== null) {
        deleteOption(optionToDelete.value);
        optionToDelete.value = null;
    }
});
</script>

<style scoped>
.question-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* 编辑器头部 */
.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
}

.editor-title {
    font-size: 18px;
    font-weight: bold;
}

/* 编辑器主体 */
.editor-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
}

.editor-section {
    margin-bottom: 24px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #323233;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.section-actions {
    display: flex;
    gap: 8px;
}

.content-editor {
    border: 1px solid #ebedf0;
    border-radius: 8px;
    overflow: hidden;
}

.format-tools {
    display: flex;
    padding: 8px 12px;
    background-color: #f7f8fa;
    gap: 16px;
}

.options-list {
    border: 1px solid #ebedf0;
    border-radius: 8px;
    overflow: hidden;
}

.option-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
}

.option-item:last-child {
    border-bottom: none;
}

.option-number {
    min-width: 30px;
    font-weight: bold;
    color: #323233;
}

.option-input {
    flex: 1;
}

.option-actions {
    display: flex;
    gap: 12px;
    margin-left: 8px;
    color: #969799;
}

.settings .van-cell {
    padding: 12px 0;
}

.settings .van-dropdown-menu {
    width: auto;
}

/* 编辑器底部 */
.editor-footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 16px;
    background-color: #fff;
    box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
}

.delete-confirm {
    padding: 24px;
    text-align: center;
}

.delete-confirm p {
    margin-top: 12px;
    font-size: 16px;
}
</style>