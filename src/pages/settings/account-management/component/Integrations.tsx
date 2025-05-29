/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Divider } from '$app/components/cards/Divider';
import { useTranslation } from 'react-i18next';
import { isHosted, isSelfHosted } from '$app/common/helpers';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { ArrowRight } from '$app/components/icons/ArrowRight';
import { useNavigate } from 'react-router-dom';
import { CircleLock } from '$app/components/icons/CircleLock';
import { ArrowsOppositeDirection } from '$app/components/icons/ArrowsOppositeDirection';
import { BookOpen } from '$app/components/icons/BookOpen';
import { ConnectedDots } from '$app/components/icons/ConnectedDots';
import { ChartLine } from '$app/components/icons/ChartLine';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function Integrations() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const colors = useColorScheme();

  const { isAdmin } = useAdmin();

  return (
    <div className="flex flex-col space-y-4 px-4 sm:px-6 pt-2 pb-4">
      {(((proPlan() || enterprisePlan()) && isHosted()) || isSelfHosted()) &&
        isAdmin && (
          <Box
            className="flex justify-between items-center p-4 border shadow-sm w-full rounded-md cursor-pointer"
            theme={{
              backgroundColor: colors.$1,
              hoverBackgroundColor: colors.$4,
            }}
            onClick={() => navigate('/settings/integrations/api_tokens')}
            style={{ borderColor: colors.$24 }}
          >
            <div className="flex items-center space-x-2">
              <CircleLock color={colors.$3} size="1.4rem" />

              <span className="text-sm" style={{ color: colors.$3 }}>
                {t('api_tokens')}
              </span>
            </div>

            <div>
              <ArrowRight color={colors.$3} size="1.4rem" strokeWidth="1.5" />
            </div>
          </Box>
        )}

      <Box
        className="flex justify-between items-center p-4 border shadow-sm w-full rounded-md cursor-pointer"
        theme={{
          backgroundColor: colors.$1,
          hoverBackgroundColor: colors.$4,
        }}
        onClick={() => navigate('/settings/integrations/api_webhooks')}
        style={{ borderColor: colors.$24 }}
      >
        <div className="flex items-center space-x-2">
          <ArrowsOppositeDirection
            color={colors.$3}
            size="1.4rem"
            strokeWidth="1"
          />

          <span className="text-sm" style={{ color: colors.$3 }}>
            {t('api_webhooks')}
          </span>
        </div>

        <div>
          <ArrowRight color={colors.$3} size="1.4rem" strokeWidth="1.5" />
        </div>
      </Box>

      <Box
        className="flex justify-between items-center p-4 border shadow-sm w-full rounded-md cursor-pointer"
        theme={{
          backgroundColor: colors.$1,
          hoverBackgroundColor: colors.$4,
        }}
        onClick={() => window.open('https://invoiceninja.github.io', '_blank')}
        style={{ borderColor: colors.$24 }}
      >
        <div className="flex items-center space-x-2">
          <BookOpen color={colors.$3} size="1.4rem" />

          <span className="text-sm" style={{ color: colors.$3 }}>
            {t('api_docs')}
          </span>
        </div>

        <div>
          <ArrowRight color={colors.$3} size="1.4rem" strokeWidth="1.5" />
        </div>
      </Box>

      <div className="py-4">
        <Divider
          className="border-dashed"
          withoutPadding
          style={{ borderColor: colors.$20 }}
        />
      </div>

      <Box
        className="flex justify-between items-center p-4 border shadow-sm w-full rounded-md cursor-pointer"
        theme={{
          backgroundColor: colors.$1,
          hoverBackgroundColor: colors.$4,
        }}
        onClick={() =>
          window.open(
            'https://zapier.com/apps/invoice-ninja/integrations',
            '_blank'
          )
        }
        style={{ borderColor: colors.$24 }}
      >
        <div className="flex items-center space-x-2">
          <ConnectedDots color={colors.$3} size="1.4rem" />

          <span className="text-sm" style={{ color: colors.$3 }}>
            Zapier
          </span>
        </div>

        <div>
          <ArrowRight color={colors.$3} size="1.4rem" strokeWidth="1.5" />
        </div>
      </Box>

      <Box
        className="flex justify-between items-center p-4 border shadow-sm w-full rounded-md cursor-pointer"
        theme={{
          backgroundColor: colors.$1,
          hoverBackgroundColor: colors.$4,
        }}
        onClick={() => navigate('/settings/integrations/analytics')}
        style={{ borderColor: colors.$24 }}
      >
        <div className="flex items-center space-x-2">
          <ChartLine color={colors.$3} size="1.4rem" strokeWidth="1" />

          <span className="text-sm" style={{ color: colors.$3 }}>
            {t('analytics')}
          </span>
        </div>

        <div>
          <ArrowRight color={colors.$3} size="1.4rem" strokeWidth="1.5" />
        </div>
      </Box>
    </div>
  );
}
