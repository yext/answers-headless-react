import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { createVerticalQueryResponse } from './responses/vertical-query';
import { universalQueryResponse, universalQueryResponseWithFilters } from './responses/universal-query';

// Any unhandled requests are dropped and logged as warnings
const handlers = [
  rest.get(/answers\/vertical\/query/, (req, res, ctx) => {
    return res(
      ctx.json(createVerticalQueryResponse()),
    );
  }),
  rest.get(/answers\/query/, (req, res, ctx) => {
    const input = req.url.searchParams.get('input');
    switch(input) {
      case 'resultsWithFilter':
        return res(
          ctx.json(universalQueryResponseWithFilters),
        );
      default:
        return res(
          ctx.json(universalQueryResponse),
        );
    }
  })
];

export const server = setupServer(...handlers);
