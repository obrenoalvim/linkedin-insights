import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from './table';

const columns = [{ key: 'title', label: 'Title', sortable: true }];
const rows = [{ title: 'Charlie' }, { title: 'Alice' }, { title: 'Bob' }];

function firstDataCell() {
  const rowEls = screen.getAllByRole('row');
  // row 0 is the header row; row 1 is the first data row.
  return rowEls[1].querySelector('td')!;
}

describe('Table', () => {
  it('renders rows in the given order by default', () => {
    render(<Table columns={columns} rows={rows} />);
    expect(firstDataCell()).toHaveTextContent('Charlie');
  });

  it('sorts rows ascending/descending when the column header is clicked', async () => {
    const user = userEvent.setup();
    render(<Table columns={columns} rows={rows} />);
    const header = screen.getByRole('button', { name: 'Title' });

    await user.click(header);
    expect(firstDataCell()).toHaveTextContent('Alice');

    await user.click(header);
    expect(firstDataCell()).toHaveTextContent('Charlie');
  });
});
