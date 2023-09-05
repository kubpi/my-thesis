import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";

export function CardBody() {
  return (
    <>
      <Card className="top-card">
        <Form className="d-flex search-matches-form">
          <Form.Control 
            type="search"
            placeholder="Search"
            className="me-2 search-bar"
            aria-label="Search"
          />
        </Form>
      </Card>
    </>
  );
}
