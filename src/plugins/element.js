import Vue from 'vue'
import { Button } from 'element-ui'
import { Form, formItem, Input, Message, Container, Main, Aside, Footer, Header, Menu, Submenu, MenuItem, Breadcrumb, BreadcrumbItem, Card, Row, Col, Table, TableColumn, Switch, Tooltip, Pagination, Dialog, MessageBox } from 'element-ui'

Vue.use(formItem)
Vue.use(Switch)
Vue.use(Dialog)
Vue.use(Tooltip)
Vue.use(Form)
Vue.use(Pagination)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Input)
Vue.use(Button)
Vue.use(Container)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Footer)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(Menu)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Col)
Vue.use(Row)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm