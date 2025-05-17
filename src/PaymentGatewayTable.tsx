import { useCallback, useEffect, useState } from "react";
import { Col, Row, Table, Tooltip } from "antd";
import { paymentGateways } from "./data";
import type { Method } from "./data/types";

interface PaymentGatewayTableProps {
  selectedPaymentMethod: number;
  amount: string;
}

export const PaymentGatewayTable: React.FC<PaymentGatewayTableProps> = ({
  selectedPaymentMethod,
  amount,
}): React.JSX.Element => {
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
              let amountDeduced = parseFloat(amount) - calculatedValues[key];
              amountDeduced = isNaN(amountDeduced) ? 0 : amountDeduced;

              return (
                <Col
                  key={key}
                  style={{
                    marginRight: index < options.length - 1 ? "56px" : 0,
                    marginTop: 8,
                    marginBottom: 8,
                  }}
                >
                  {method.description && <div style={{ fontWeight: 800 }}>{method.description}</div>}
                  {method.installments && <div style={{ fontWeight: 800 }}>Parcelas: {method.installments}</div>}
                  <div>Taxa fixa: R$ {(method.fixedFeeInCents / 100).toFixed(2)}</div>
                  <div>Taxa percentual: {method.percentageFee}%</div>
                  {calculatedValues[key] !== undefined && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <p style={{ fontWeight: 800, color: "#722ed1" }}>
                        Valor final: R$ {calculatedValues[key].toFixed(2)}
                      </p>

                      <p style={{ fontWeight: 800, color: amountDeduced === 0 ? "#007bff" : "#ff4d4f" }}>
                        ({amountDeduced !== 0 ? "-" : ""}R$ {amountDeduced.toFixed(2)})
                      </p>
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
        scroll={{ x: 800, y: "calc(100vh - 350px - 48px)" }}
        style={{ height: "100%" }}
      />
    </div>
  );
};
