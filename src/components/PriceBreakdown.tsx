import type { PriceQuote } from '../models/hotel';
import { formatMoney, plural } from '../utils/format';

/** Room price split by season, as calculated by the server. */
export function PriceBreakdown({ quote }: { quote: PriceQuote }) {
  return (
    <table className="summary-table">
      <tbody>
        {quote.lowSeasonNights > 0 && (
          <tr>
            <td>
              {plural(quote.lowSeasonNights, 'noche', 'noches')} en temporada baja × {formatMoney(quote.lowSeasonPrice)}
            </td>
            <td className="num">{formatMoney(quote.lowSeasonNights * quote.lowSeasonPrice)}</td>
          </tr>
        )}
        {quote.highSeasonNights > 0 && (
          <tr>
            <td>
              {plural(quote.highSeasonNights, 'noche', 'noches')} en temporada alta × {formatMoney(quote.highSeasonPrice)}{' '}
              <span className="badge badge--high">x1.5</span>
            </td>
            <td className="num">{formatMoney(quote.highSeasonNights * quote.highSeasonPrice)}</td>
          </tr>
        )}
      </tbody>
      <tfoot>
        <tr>
          <td>Total habitación ({plural(quote.nights, 'noche', 'noches')})</td>
          <td className="num">{formatMoney(quote.total)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
