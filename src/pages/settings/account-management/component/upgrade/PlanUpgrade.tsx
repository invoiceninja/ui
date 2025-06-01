
import { useTranslation } from "react-i18next";
import { Button } from "$app/components/forms";

export function PlanUpgrade() {

    const { t } = useTranslation();

    function goFree() {
        console.log('goFree');
    }

    function removeDocuNinja() {
        console.log('removeDocuNinja');
    }

    return (
    <div className="space-y-2">
        
        <div className="mt-4">
            <div className="flex flex-col items-center  ">
                <h4 className="text-lg font-semibold">{t('downgrade')}</h4>
            </div>

            <div className="flex flex-col items-center space-y-4 mt-4">
                <Button behavior="button" type="secondary" onClick={() => goFree()}>
                    {t('free_plan')}
                </Button>

                <Button behavior="button" type="secondary" onClick={() => removeDocuNinja()}>
                    {t('remove_docu_ninja')}
                </Button>
            <p>Need help? Please use the in app message feature to raise a support request.</p>
            </div>

        </div>
        
    </div>
    )
}