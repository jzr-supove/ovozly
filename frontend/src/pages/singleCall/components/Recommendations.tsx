import { Card } from "antd";
import { ToolOutlined } from "@ant-design/icons";
import { capitalize } from "@/utils/helpers";

export interface ActionRecommendation {
  action_type: string;
  details: string;
}

interface RecommendationsProps {
  actionRecommendations: ActionRecommendation[] | undefined;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  actionRecommendations,
}) => {
  return (
    <Card className="py-4 px-3">
      {actionRecommendations &&
        actionRecommendations.map((item) => (
          <div
            className="d-flex mb-5  justify-content-start align-items-start"
            key={item.action_type}
          >
            <ToolOutlined
              className="fs-3 me-3 mt-1"
              style={{ color: "#17C653" }}
            />

            <div className="d-flex flex-column">
              <div className="d-flex align-items-center mb-2">
                <h5 className="text-gray-900 text-hover-primary me-3 fw-semibold mb-0">
                  {capitalize(item.action_type)}
                </h5>
              </div>

              <span className="text-muted fw-semibold fs-6">
                {item.details}
              </span>
            </div>
          </div>
        ))}
    </Card>
  );
};

export default Recommendations;
