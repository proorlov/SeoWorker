\c seo;

/*
ОБНОВЛЕНИЕ корридора
*/

CREATE OR REPLACE FUNCTION PARAMS_REPLACE(
    vURL_ID integer,
    vCONDITION_ID integer,
    arrPARAMS JSON[]
) RETURNS VOID AS $$
    DECLARE vPARAMTYPE_ID INTEGER;
    DECLARE vPARAM_VALUE VARCHAR;
    DECLARE jPARAM JSON;
    BEGIN

        DELETE
            FROM
                params
            WHERE
                CONDITION_ID = vCONDITION_ID
                AND URL_ID = vURL_ID;

        FOR jPARAM IN SELECT * FROM unnest(arrPARAMS)
        LOOP
            RAISE NOTICE 'jPARAM = %',jPARAM;
            SELECT PARAMTYPE_ID INTO vPARAMTYPE_ID FROM paramtypes WHERE PARAMTYPE_NAME = jPARAM->>'name'::VARCHAR;
            SELECT jPARAM->>'val'::VARCHAR INTO vPARAM_VALUE;

            IF vPARAM_VALUE is not null THEN
                INSERT INTO params (URL_ID, CONDITION_ID, PARAMTYPE_ID, PARAM_VALUE, DATE_CREATE) VALUES
                    (vURL_ID, vCONDITION_ID, vPARAMTYPE_ID, vPARAM_VALUE, NOW());
            END IF;
        END LOOP;

    END;
$$ LANGUAGE plpgsql;
-- SELECT CONDITION_REPLACE(1111, '{"test":"titleCS","links":[{"url":"test"},{"url":"test2"}]}');