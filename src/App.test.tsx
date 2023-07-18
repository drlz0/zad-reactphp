import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

test('creates a new channel and verifies its addition to the table', async () => {
  render(<App />);

  const channelInput = screen.getByPlaceholderText('Channel');
  const amountInput = screen.getByPlaceholderText('Amount');
  const proceedButton = screen.getByText('Proceed');

  fireEvent.change(channelInput, { target: { value: 'Googletest' } });
  fireEvent.change(amountInput, { target: { value: '50' } });
  fireEvent.click(proceedButton);

  // Wait for the asynchronous update to complete
  await screen.findByText('Googletest');
  await screen.findByText('50');

  expect(screen.getByText('Googletest')).toBeInTheDocument();
  expect(screen.getByText('50')).toBeInTheDocument();
});

test('updates an existing channel and verifies its update in the table', async () => {
  render(<App />);

  // Select the UPDATE option
  const selectElement = screen.getByRole('combobox');
  fireEvent.change(selectElement, { target: { value: 'UPDATE' } });

  // Enter channel and amount values
  const channelInput = screen.getByPlaceholderText('Channel');
  fireEvent.change(channelInput, { target: { value: 'Googletest' } });

  const amountInput = screen.getByPlaceholderText('Amount');
  fireEvent.change(amountInput, { target: { value: '100' } });

  // Click the Proceed button
  const proceedButton = screen.getByText('Proceed');
  fireEvent.click(proceedButton);

  // Wait for the asynchronous update to complete
  await waitFor(() => {
    // Check if the channel's amount is updated in the table
    const amountCells = screen.queryAllByTestId('amount-cell');
    const amountTexts = amountCells.map((cell) => cell.textContent);
    expect(amountTexts).toContain('100');
  });
});




test('deletes an existing channel and verifies its removal from the table', () => {
  render(<App />);
  // Choose "DELETE" option
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'DELETE' } });
  // Enter channel name
  fireEvent.change(screen.getByPlaceholderText('Channel'), { target: { value: 'Googletest' } });
  // Click "Proceed"
  fireEvent.click(screen.getByText('Proceed'));

  // Verify if the channel is removed from the table
  expect(screen.queryByText('Googletest')).not.toBeInTheDocument();
});

test('displays an error message for an invalid amount', () => {
  render(<App />);
  // Choose "CREATE" option
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'CREATE' } });
  // Enter channel name
  fireEvent.change(screen.getByPlaceholderText('Channel'), { target: { value: 'Googletest' } });
  // Enter invalid amount
  fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: 'testnum##' } });
  // Click "Proceed"
  fireEvent.click(screen.getByText('Proceed'));

  // Verify if the error message is displayed
  expect(screen.getByText('Amount should be a valid integer')).toBeInTheDocument();
});
