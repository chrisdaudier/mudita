import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Enter your tasks for the day text', () => {
  render(<App />);
  const element = screen.getByText(/Enter your tasks for the day/i);
  expect(element).toBeInTheDocument();
});
