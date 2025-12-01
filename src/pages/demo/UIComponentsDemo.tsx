import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  TextArea,
  Badge,
  Spinner,
  SpinnerOverlay,
  Alert,
  Modal,
  ModalFooter,
  Skeleton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonTable,
} from '../components/shared';

export default function UIComponentsDemo() {
  const [showModal, setShowModal] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 'bold' }}>
          UI Components Library
        </h1>

        {/* Buttons Section */}
        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <h2>Buttons</h2>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button isLoading>Loading...</Button>
              <Button disabled>Disabled</Button>
              <Button fullWidth>Full Width</Button>
            </div>
          </CardBody>
        </Card>

        {/* Cards Section */}
        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <h2>Cards</h2>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <Card variant="default" hoverable>
                <CardBody>
                  <h3>Default Card</h3>
                  <p>This is a default card with hover effect</p>
                </CardBody>
              </Card>
              <Card variant="outlined">
                <CardBody>
                  <h3>Outlined Card</h3>
                  <p>This is an outlined card</p>
                </CardBody>
              </Card>
              <Card variant="elevated">
                <CardBody>
                  <h3>Elevated Card</h3>
                  <p>This is an elevated card</p>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>

        {/* Inputs Section */}
        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <h2>Form Inputs</h2>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Input label="Email" type="email" placeholder="Enter your email" />
              <Input label="Password" type="password" placeholder="Enter your password" error="Password is required" />
              <Input label="Search" placeholder="Search..." helperText="Search for anything" />
              <TextArea label="Description" placeholder="Enter description..." rows={4} />
            </div>
          </CardBody>
        </Card>

        {/* Badges Section */}
        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <h2>Badges</h2>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </CardBody>
        </Card>

        {/* Spinners Section */}
        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <h2>Spinners</h2>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="xl" />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={() => setShowSpinner(true)}>Show Spinner Overlay</Button>
            </div>
          </CardBody>
        </Card>

        {/* Alerts Section */}
        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <h2>Alerts</h2>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {showAlert && (
                <Alert variant="info" title="Info Alert" dismissible onDismiss={() => setShowAlert(false)}>
                  This is an informational alert message.
                </Alert>
              )}
              <Alert variant="success" title="Success!">
                Your action was completed successfully.
              </Alert>
              <Alert variant="warning">
                This is a warning message without a title.
              </Alert>
              <Alert variant="danger" title="Error">
                Something went wrong. Please try again.
              </Alert>
            </div>
          </CardBody>
        </Card>

        {/* Modal Section */}
        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <h2>Modal</h2>
          </CardHeader>
          <CardBody>
            <Button onClick={() => setShowModal(true)}>Open Modal</Button>
          </CardBody>
        </Card>

        {/* Skeleton Loaders Section */}
        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <h2>Skeleton Loaders</h2>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Card Skeleton</h3>
                <SkeletonCard />
              </div>
              <div>
                <h3 style={{ marginBottom: '1rem' }}>List Items</h3>
                <SkeletonListItem showAvatar />
                <SkeletonListItem showAvatar />
                <SkeletonListItem showAvatar={false} />
              </div>
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Table Skeleton</h3>
                <SkeletonTable rows={3} columns={4} />
              </div>
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Custom Skeleton</h3>
                <Skeleton width="80%" height="20px" style={{ marginBottom: '0.5rem' }} />
                <Skeleton width="100%" height="20px" style={{ marginBottom: '0.5rem' }} />
                <Skeleton width="60%" height="20px" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Modal Component */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Example Modal" size="md">
          <p>This is a modal dialog. You can put any content here.</p>
          <Input label="Name" placeholder="Enter your name" style={{ marginTop: '1rem' }} />
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Confirm
            </Button>
          </ModalFooter>
        </Modal>

        {/* Spinner Overlay */}
        {showSpinner && (
          <SpinnerOverlay message="Loading, please wait..." />
        )}
        {showSpinner && (() => {
          setTimeout(() => setShowSpinner(false), 2000);
          return null;
        })()}
      </div>
    </div>
  );
}
