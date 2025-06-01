import { endpoint } from "$app/common/helpers";
import { useCurrentAccount } from "$app/common/hooks/useCurrentAccount";
import { useCurrentCompany } from "$app/common/hooks/useCurrentCompany";
import { Company } from "$app/common/interfaces/docuninja/api";
import { Card } from "$app/components/cards";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { request } from "$app/common/helpers/request";
import { Button } from "$app/components/forms";
import { useState } from "react";
import { Check } from "react-feather";
import { useAccentColor } from "$app/common/hooks/useAccentColor";
import { useColorScheme } from "$app/common/colors";
import { useLogin } from "$app/common/queries/docuninja";
import { Alert } from "$app/components/Alert";

export function PlanUpgrade() {

    const { t } = useTranslation();
    const account = useCurrentAccount();
    const [startTrialFlag, setStartTrialFlag] = useState(false);


    return (
    <div className="space-y-2">
        
        <div className="mt-4">
            <div className="flex flex-col items-center  ">
                <h4 className="text-lg font-semibold">{t('downgrade')}</h4>
            </div>

            <div className="flex flex-col items-center space-y-4 mt-4">
                <Button behavior="button" type="secondary" onClick={() => setStartTrialFlag(true)}>
                    {t('free_plan')}
                </Button>

                <Button behavior="button" type="secondary" onClick={() => setStartTrialFlag(true)}>
                    {t('remove_docu_ninja')}
                </Button>
            <p>Need help? Please use the in app message feature to raise a support request.</p>
            </div>

        </div>
        
    </div>
    )
}