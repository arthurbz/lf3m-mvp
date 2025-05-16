import { Col, Form, Row } from "antd";
import { Radio, Table, Input, Space, Typography, ConfigProvider, Tooltip } from "antd";
import { paymentGateways } from "./data";
import { PaymentMethod, paymentMethodLabels } from "./data/types";
import type { Method } from "./data/types";
import { useState, useEffect, useCallback } from "react";

export const App: React.FC = (): React.JSX.Element => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number>(PaymentMethod.PIX);
  const [amount, setAmount] = useState<string>("99.90");
  const [calculatedValues, setCalculatedValues] = useState<Record<string, number>>({});

  const calculateValue = (value: number, method: Method) => {
    const fixedFee = method.fixedFeeInCents / 100;
    const percentageFee = (value * method.percentageFee) / 100;
    return value - fixedFee - percentageFee;
  };

  const calculateAll = useCallback(() => {
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount)) {
      return;
    }

    const newValues: Record<string, number> = {};

    paymentGateways.forEach((gateway) => {
      const options = gateway.supportedOptions.filter((m) => m.type === selectedPaymentMethod);

      options.forEach((option, index) => {
        const key = `${gateway.name}-${option.installments || "single"}-${index}`;
        newValues[key] = calculateValue(numericAmount, option);
      });
    });

    setCalculatedValues(newValues);
  }, [amount, selectedPaymentMethod]);

  useEffect(() => {
    if (amount) {
      calculateAll();
    }
  }, [amount, calculateAll]);

  const columns = [
    {
      title: "",
      dataIndex: "gateway",
      key: "gateway",
      width: 300,
      render: (_: unknown, __: unknown, index: number) => {
        const gateway = paymentGateways[index];
        return (
          <div
            style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", flexDirection: "column" }}
          >
            <Tooltip title={gateway.note}>
              <a href={gateway.sourceUrl} target="_blank" rel="noopener noreferrer">
                <img style={{ width: 100 }} alt={gateway.name} src={gateway.imageUrl} />
              </a>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Opções e Preços",
      dataIndex: "options",
      key: "options",
      render: (_: unknown, __: unknown, index: number) => {
        const gateway = paymentGateways[index];
        const options = gateway.supportedOptions.filter((m) => m.type === selectedPaymentMethod);

        if (options.length === 0) {
          return "🚫 Não suportado";
        }

        return (
          <Row>
            {options.map((method, index) => {
              const key = `${gateway.name}-${method.installments || "single"}-${index}`;

              return (
                <Col key={key} style={{ marginRight: index < options.length - 1 ? "56px" : 0 }}>
                  {method.description && <div style={{ fontWeight: 800 }}>{method.description}</div>}
                  {method.installments && <div style={{ fontWeight: 800 }}>Parcelas: {method.installments}</div>}
                  <div>Taxa fixa: R$ {(method.fixedFeeInCents / 100).toFixed(2)}</div>
                  <div>Taxa percentual: {method.percentageFee}%</div>
                  {calculatedValues[key] !== undefined && (
                    <div style={{ fontWeight: 800, color: "#722ed1" }}>
                      Valor final: R$ {calculatedValues[key].toFixed(2)}
                    </div>
                  )}
                </Col>
              );
            })}
          </Row>
        );
      },
    },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#722ed1" } }}>
      <div
        style={{
          padding: "24px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          margin: 0,
          boxSizing: "border-box",
        }}
      >
        <Typography.Title
          level={3}
          style={{ textAlign: "center", color: "#722ed1", marginBottom: "56px", marginTop: "20px" }}
        >
          💸 LF3M - Less fees means more money
        </Typography.Title>

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
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: "200px" }}
                  min={0}
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

        <div style={{ flex: 1, overflow: "hidden" }}>
          <Table
            columns={columns}
            dataSource={paymentGateways.map((gateway, index) => ({
              key: `row-${gateway.name}-${index}`,
              gateway: gateway,
              options: gateway.supportedOptions,
            }))}
            pagination={false}
            bordered
            scroll={{ x: "max-content", y: "calc(100vh - 350px - 48px)" }}
            style={{ height: "100%" }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};
