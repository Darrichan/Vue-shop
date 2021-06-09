<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert title="只允许为第三级分类设置相关参数！"
                type="warning"
                :closable="false"
                show-icon>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>
            选择商品分类：
            <!-- 商品分类级联选择框 -->
            <el-cascader v-model="selectedCateList"
                         :options="cateList"
                         :props="{ expandTrigger: 'hover' ,value:'cat_id',label:'cat_name',children:'children'}"
                         @change="handleChange"
                         style="width:250px">
            </el-cascader>
          </span>
        </el-col>
        <!-- tab页面区域 -->
        <el-col>
          <el-tabs v-model="activeName"
                   @tab-click="handleTabClick">
            <!-- 添加动态参数面板 -->
            <el-tab-pane label="动态参数"
                         name="many">
              <el-button size="mini"
                         type="primary"
                         :disabled="this.isBtnDisabled"
                         @click="addDialogVisible=true">添加参数</el-button>
              <!-- 动态参数的表格 -->
              <el-table :data="manyTableData"
                        border
                        stripe>
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag v-for="(item,i) in scope.row.attr_vals"
                            :key="i"
                            closable
                            @close="handleClose(i,scope.row)">{{item}}</el-tag>

                    <!-- 输入文本框 -->
                    <el-input class="input-new-tag"
                              v-if="scope.row.inputVisible"
                              v-model="scope.row.inputValue"
                              ref="saveTagInput"
                              size="small"
                              @keyup.enter.native="handleInputConfirm(scope.row)"
                              @blur="handleInputConfirm(scope.row)">
                    </el-input>
                    <!-- 添加的按钮 -->
                    <el-button v-else
                               class="button-new-tag"
                               size="small"
                               @click="showInput (scope.row) ">+ New Tag</el-button>

                  </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="参数名称"
                                 prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="primary"
                               icon="el-icon-edit"
                               size="mini"
                               @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                    <el-button type="danger"
                               icon="el-icon-delete"
                               size="mini"
                               @click="removeParams(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>

              </el-table>
            </el-tab-pane>
            <!-- 添加静态属性按钮 -->
            <el-tab-pane label="静态属性"
                         name="only">
              <el-button size="mini"
                         type="primary"
                         :disabled="this.isBtnDisabled"
                         @click="addDialogVisible=true">添加属性</el-button>
              <!-- 静态属性的表格 -->
              <el-table :data="onlyTabelData"
                        border
                        stripe>
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag v-for="(item,i) in scope.row.attr_vals"
                            :key="i"
                            closable
                            @close="handleClose(i,scope.row)">{{item}}</el-tag>

                    <!-- 输入文本框 -->
                    <el-input class="input-new-tag"
                              v-if="scope.row.inputVisible"
                              v-model="scope.row.inputValue"
                              ref="saveTagInput"
                              size="small"
                              @keyup.enter.native="handleInputConfirm(scope.row)"
                              @blur="handleInputConfirm(scope.row)">
                    </el-input>
                    <!-- 添加的按钮 -->
                    <el-button v-else
                               class="button-new-tag"
                               size="small"
                               @click="showInput (scope.row) ">+ New Tag</el-button>

                  </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="属性名称"
                                 prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="primary"
                               icon="el-icon-edit"
                               size="mini"
                               @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                    <el-button type="danger"
                               icon="el-icon-delete"
                               size="mini"
                               @click="removeParams(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>

              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>

      </el-row>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加'+titleText"
               :visible.sync="addDialogVisible"
               width="50%"
               @close="addDialogClosed">
      <el-form ref="addFormRef"
               :rules="addFormRules"
               :model="addForm"
               label-width="80px">
        <el-form-item :label="titleText"
                      prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addParams">确 定</el-button>
      </span>

    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog :title="'修改'+titleText"
               :visible.sync="editDialogVisible"
               width="50%"
               @close="editDialogClosed">
      <el-form ref="editFormRef"
               :rules="addFormRules"
               :model="editForm"
               label-width="80px">
        <el-form-item :label="titleText"
                      prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editParams">确 定</el-button>
      </span>

    </el-dialog>

  </div>
</template>

<script>
export default {
  created () {
    this.getCateList();
  },
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框双向绑定选择到的数组
      selectedCateList: [],
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTabelData: [],
      addDialogVisible: false,
      // 添加表单对象
      addForm: {
        attr_name: '',
      },
      // 表单验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改表单是否可见的flag
      editDialogVisible: false,
      // 修改的表单的数据对象
      editForm: {},
      // 控制按钮与文本框的切换显示
      inputVisible: false,
      // 文本框中输入的内容
      inputValue: '',

    }
  },
  methods: {
    // 获取所有的商品分类列表函数
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data;
      console.log(this.cateList)
    },
    // 级联选择框发生变化的时候会触发的函数
    handleChange () {
      this.getParamsData();
    },
    // Tab页面点击事件的处理函数
    handleTabClick () {
      this.getParamsData();

    },
    async getParamsData () {
      if (this.selectedCateList.length !== 3) return
      // 根据所选的分类的id 和当前所处的面板，获得对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } });
      if (res.meta.status !== 200) return this.$$message.error(res.meta.msg)

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })

      console.log(res.data);

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTabelData = res.data
      }
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields();
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getParamsData();
      })
    },
    // 点击按钮展示修改的对话框
    async showEditDialog (attr_id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, { params: { attr_sel: this.activeName } });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 重置修改表单，修改表单关闭的处理函数
    editDialogClosed () {
      this.$refs.editFormRef.resetFields();
    },
    // 修改参数的确认按钮
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        console.log('表单验证正确，且按钮按下')
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) return this.$message.error(res.meta.meg)
        this.$message.success(res.meta.msg)
        this.getParamsData()
        this.editDialogVisible = false

      })
    },
    // 根据id删除对应的参数按钮
    async removeParams (attr_id) {
      const confirmResult = await this.$confirm('此操作将永久删除该' + this.titleText + ', 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败！')
      this.$message.success('删除分类成功！')
      this.getParamsData();
    },
    // 文本框失去焦点或按下了enter都会出发
    handleInputConfirm (row) {
      if (row.inputValue.trim().length == 0) {
        row.inputValue = '';
        row.inputVisible = false
        // this.$message.error('输入的格式不符合规则！')
        return
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = '';
      row.inputVisible = false
      // 发起请求
      this.saveAttrVals(row)
    },
    // 显示文本输入框
    showInput (row) {
      console.log(row)
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      })
    },
    async saveAttrVals (row) {
      // 发起请求
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(',') })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
    },
    // 删除对应的参数选项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row);
    }
  },
  computed: {
    isBtnDisabled () {
      if (this.selectedCateList.length !== 3) {
        return true
      }
      return false
    },
    cateId () {
      if (this.selectedCateList.length === 3) {
        return this.selectedCateList[2]
      } else {
        return null
      }
    },
    titleText () {
      if (this.activeName == 'many') {
        return '动态参数'
      }
      return '静态属性'

    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0px;
}

.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 90px;
}
</style>
