import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import './App.css';

const App: React.FC = () => {
  const chartContainerRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<'pie'> | null>(null);
  const [channelInput, setChannelInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [selectedAction, setSelectedAction] = useState('CREATE');
  const [channels, setChannels] = useState<{ channel: string; amount: number }[]>([]);

  const handleChannelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChannelInput(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmountInput(event.target.value);
  };

  const handleActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAction(event.target.value);
  };

  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleProceedClick = () => {
    // Validation for CREATE action
    if (selectedAction === 'CREATE') {
      // Check if the channel input matches the required pattern
      const channelRegex = /^[A-Za-z0-9]{1,15}$/;
      if (!channelRegex.test(channelInput)) {
        setFeedbackMessage(
          'Channel should contain only alphanumeric characters and be between 1 and 15 characters long'
        );
        return;
      }
  
      // Check if the amount input is a valid integer in the range 1-999999
      const amountRegex = /^\d+$/;
      if (!amountRegex.test(amountInput)) {
        setFeedbackMessage('Amount should be a valid integer');
        return;
      }

      const amount = parseInt(amountInput);
      if (isNaN(amount) || amount < 1 || amount > 999999) {
        setFeedbackMessage('Amount should be a valid integer between 1 and 999999');
        return;
      }
    }
  
    // Validation for UPDATE action
    if (selectedAction === 'UPDATE') {
      // Check if the channel input matches the required pattern
      const channelRegex = /^[A-Za-z0-9]{1,15}$/;
      if (!channelRegex.test(channelInput)) {
        setFeedbackMessage(
          'Channel should contain only alphanumeric characters and be between 1 and 15 characters long'
        );
        return;
      }
  
      // Check if the amount input is a valid integer in the range 1-999999
      const amountRegex = /^\d+$/;
      if (!amountRegex.test(amountInput)) {
        setFeedbackMessage('Amount should be a valid integer');
        return;
      }
      const amount = parseInt(amountInput);
      if (isNaN(amount) || amount < 1 || amount > 999999) {
        setFeedbackMessage('Amount should be a valid integer between 1 and 999999');
        return;
      }
    }
  
    // Validation for DELETE action
    if (selectedAction === 'DELETE') {
      // Check if the channel input matches the required pattern
      const channelRegex = /^[A-Za-z0-9]{1,15}$/;
      if (!channelRegex.test(channelInput)) {
        setFeedbackMessage(
          'Channel should contain only alphanumeric characters and be between 1 and 15 characters long'
        );
        return;
      }
    }
  
// Make API call to PHP script based on the selected action and inputs
const requestData = {
  action: selectedAction,
  channel: channelInput,
  amount: amountInput,
};

  // Make the API call to the PHP script
  fetch('http://localhost/php/CreateChannel.php', {
    method: 'POST',
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Process the response data as needed
      console.log(data);
      // Check if the response contains a feedback message
      if (data.message) {
        setFeedbackMessage(data.message);
      }
      // Fetch the updated channel data from the server
      fetch('http://localhost/php/GetChannels.php')
        .then((response) => response.json())
        .then((channelsData: { channel: string; amount: number }[]) => {
          // Update the channels state with the retrieved data
          setChannels(channelsData);

          // Update the chart using the updated data
          if (chartRef.current) {
            chartRef.current.data.labels = channelsData.map((item: { channel: string }) => item.channel);
            chartRef.current.data.datasets[0].data = channelsData.map((item: { amount: number }) => item.amount);
            chartRef.current.update();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      // Handle any errors that occurred during the API call
      console.error(error);
    });
};
  

  useEffect(() => {
    // Fetch the initial channel data from the server
    fetch('http://localhost/php/GetChannels.php')
      .then((response) => response.json())
      .then((channelsData) => {
        // Update the channels state with the retrieved data
        setChannels(channelsData);
        // Create the chart using the retrieved data
        if (chartContainerRef.current) {
          const chartCtx = chartContainerRef.current.getContext('2d');
          if (chartCtx) {
            if (chartRef.current) {
              chartRef.current.destroy();
            }
            chartRef.current = new Chart(chartCtx, {
              type: 'pie',
              data: {
                labels: channelsData.map((item: any) => item.channel),
                datasets: [
                  {
                    label: 'Channel Amounts',
                    data: channelsData.map((item: any) => item.amount),
                    backgroundColor: [
                      'rgb(255, 99, 132)',
                      'rgb(54, 162, 235)',
                      'rgb(255, 205, 86)',
                    ],
                    hoverOffset: 4,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
              },
            });
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // JSX
  return (
    <div className="app-container">
      <div className="table-chart-container">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Channel</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel) => (
                <tr key={channel.channel}>
                  <td>{channel.channel}</td>
                  <td data-testid="amount-cell">{channel.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="chart-container">
          <canvas ref={chartContainerRef} width={300} height={300} />
        </div>
      </div>
      <div className="form-container">
        <select value={selectedAction} onChange={handleActionChange}>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input type="text" placeholder="Channel" value={channelInput} onChange={handleChannelChange} />
        <input type="text" placeholder="Amount" value={amountInput} onChange={handleAmountChange} />
        <button onClick={handleProceedClick}>Proceed</button>
        {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}
      </div>
    </div>
  );
};

export default App;
