import Vue from 'vue'
import { Button } from 'element-ui'
import { Form, formItem, input, Message } from 'element-ui'

Vue.use(formItem)
Vue.use(Form)
Vue.use(input)
Vue.use(Button)
Vue.prototype.$message = Message