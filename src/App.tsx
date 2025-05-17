import { useState } from "react";
import { Radio, Form, Row, Input, Space, Typography, ConfigProvider, Layout } from "antd";
import { PaymentMethod, paymentMethodLabels } from "./data/types";
import { PaymentGatewayTable } from "./PaymentGatewayTable";
import { GithubOutlined, LinkedinOutlined, GlobalOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;

export const App: React.FC = (): React.JSX.Element => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number>(PaymentMethod.PIX);
  const [amount, setAmount] = useState<string>("99.90");

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#722ed1" } }}>
      <Layout style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
        <Header style={{ background: "#fff", padding: "0 24px" }}>
          <Typography.Title level={3} style={{ textAlign: "center", color: "#722ed1", margin: "16px 0" }}>
            💸 LF3M - Less fees means more money
          </Typography.Title>
        </Header>

        <Content style={{ padding: "24px" }}>
          <Space
            direction="horizontal"
            size="middle"
            style={{ justifyContent: "center", width: "100%", marginBottom: "20px" }}
          >
            <Form size="large" layout="vertical">
              <Row style={{ gap: 24 }}>
                <Form.Item label="Qual o valor?">
                  <Input
                    size="large"
                    prefix="R$"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || parseFloat(value) > 0) {
                        setAmount(value);
                      }
                    }}
                    style={{ width: "200px" }}
                    min={0.01}
                    step={0.01}
                  />
                </Form.Item>

                <Form.Item label="Qual o método de pagamento?">
                  <Radio.Group
                    size="large"
                    buttonStyle="solid"
                    optionType="button"
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  >
                    {Object.entries(PaymentMethod)
                      .filter(([key]) => isNaN(Number(key)))
                      .map(([key, value]) => (
                        <Radio.Button key={key} value={value}>
                          {paymentMethodLabels[value]}
                        </Radio.Button>
                      ))}
                  </Radio.Group>
                </Form.Item>
              </Row>
            </Form>
          </Space>

          <PaymentGatewayTable selectedPaymentMethod={selectedPaymentMethod} amount={amount} />
        </Content>

        <Footer style={{ textAlign: "center", background: "#fff" }}>
          <Space size="large">
            <a href="https://github.com/arthurbz/lf3m-mvp" target="_blank" rel="noopener noreferrer">
              <GithubOutlined style={{ fontSize: 24, color: "#722ed1" }} />
            </a>
            <a href="https://linkedin.com/in/arthurbz/" target="_blank" rel="noopener noreferrer">
              <LinkedinOutlined style={{ fontSize: 24, color: "#722ed1" }} />
            </a>
            <a href="https://arthur.bz" target="_blank" rel="noopener noreferrer">
              <GlobalOutlined style={{ fontSize: 24, color: "#722ed1" }} />
            </a>
          </Space>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};
