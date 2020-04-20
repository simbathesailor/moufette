import React, { useState } from 'react'
import { Layout, Menu, Breadcrumb, Row } from 'antd';
import {
  SettingOutlined,
  MessageOutlined,
  HomeOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import styled from 'styled-components'
import { useQuery } from '@apollo/client';


import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import Feedbacks from './pages/Feedbacks'
import Login from './pages/Login'

import { USER } from './apollo/queries'

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;


function PrivateRoute({ children, ...rest }: any) {

  const { loading, error, data } = useQuery(USER, {})
  return (
    <Route
      {...rest}
      render={({ location }) => {

        if (loading) return <div>loading...</div>

        return data.currentUser ? (
          children
        ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: location }
              }}
            />
          )
      }
      }
    />
  );
}

const BasicExample = () => {

  const [collapsed, setCollapsed] = useState(false)
  const { loading, error, data } = useQuery(USER, {})


  const onCollapse = (collapsed: boolean) => {
    setCollapsed(collapsed);
  };
  return (
    <Router>

      <Switch>

        <Route public path="/login">
          <Login />
        </Route>

        <PrivateRoute>

          <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
              <div className="logo">
                {collapsed ? 'M' : 'Moufette v0.1'}
              </div>
              <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                <Menu.Item key="1">
                  <Link to="/">
                    <HomeOutlined />
                    <span>Home</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key="2">
                  <Link to="/feedbacks">
                    <MessageOutlined />
                    <span>Feedbacks</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key="3">
                  <Link to="/setup">
                    <SettingOutlined />
                    <span>Setup</span>
                  </Link>
                </Menu.Item>
              </Menu>
            </Sider>
            <Layout className="site-layout">
              <Header className="site-layout-background" style={{ padding: 0 }}>
                <Row justify="space-between" align="middle">
                  {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                    className: 'trigger',
                    onClick: () => onCollapse(!collapsed),
                  } as any)}
                  <span style={{ paddingRight: 24 }}>
                    {data && data.currentUser && data.currentUser.email}
                  </span>
                </Row>
              </Header>
              <Content
                className="site-layout-background"
                style={{
                  margin: '24px 16px',
                  padding: 24,
                  minHeight: 280,
                }}
              >
                <Route exact path="/">
                  <Home />
                </Route>

                <Route path="/feedbacks">
                  <Feedbacks />
                </Route>
              </Content>
            </Layout>
          </Layout>

        </PrivateRoute>
      </Switch>
    </Router>
  );
}


function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}



export default BasicExample