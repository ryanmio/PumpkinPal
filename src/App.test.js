import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the onAuthStateChanged function
jest.mock('./firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(() => () => {}),
  },
}));

jest.mock('react-ga4', () => ({
  initialize: jest.fn(),
  send: jest.fn(),
}));

test('renders without crashing', () => {
  render(<App />);
});

test('renders the register page', () => {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <App />
    </MemoryRouter>
  );
  const registerElement = screen.getByText(/Sign Up/i);
  expect(registerElement).toBeInTheDocument();
});

test('renders the header', () => {
  render(<App />);
  const headerElement = screen.getByAltText('Logo');
  expect(headerElement).toBeInTheDocument();
});

test('renders Login component', () => {
  render(<Router><App /></Router>);
  const linkElement = screen.getByText(/Login/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders Dashboard component', () => {
  render(<Router><App /></Router>);
  const linkElement = screen.getByText(/Dashboard/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders UserProfile component', () => {
  render(<Router><App /></Router>);
  const linkElement = screen.getByText(/User Profile/i);
  expect(linkElement).toBeInTheDocument();
});

test('navigates to Login page', () => {
  render(<Router><App /></Router>);
  fireEvent.click(screen.getByText(/Login/i));
  const loginElement = screen.getByText(/Email/i);
  expect(loginElement).toBeInTheDocument();
});

test('navigates to Dashboard page', () => {
  render(<Router><App /></Router>);
  fireEvent.click(screen.getByText(/Dashboard/i));
  const dashboardElement = screen.getByText(/Welcome to your Dashboard/i);
  expect(dashboardElement).toBeInTheDocument();
});

test('navigates to User Profile page', () => {
  render(<Router><App /></Router>);
  fireEvent.click(screen.getByText(/User Profile/i));
  const userProfileElement = screen.getByText(/Account Information/i);
  expect(userProfileElement).toBeInTheDocument();
});