import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/macro';
import { Flex, Link,TextField,Form, Select, Loading} from '@chia/core';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import LayoutMain from '../layout/LayoutMain';
import usePlots from '../../hooks/usePlots';
import { Button, MenuItem, Box, ListItemIcon, Typography, InputLabel,FormControl,Container, Grid} from '@material-ui/core';
import { Refresh as RefreshIcon, Folder as FolderIcon, Add as AddIcon } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import type { RootState } from '../../modules/rootReducer';
import { getPianpoolSettings, setPianpoolSettings } from '../../modules/farmerMessages';


const StyledTextField = styled(TextField)`
  min-width: 640px;
`;

type FormData = {
    enable_pool: boolean;
    pian_url: string;
    username: string;
};

export default function Farm() {
    const [loading, setLoading] = useState<boolean>(true);
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const dispatch = useDispatch();
    const hasHarvesterConnections = !!useSelector((state: RootState) =>
        state.farming_state.farmer.connections.find(
        (connection) => connection.type === 2,
        ),
    );

    const methods = useForm<FormData>({
        shouldUnregister: false,
        defaultValues: {
            enable_pool: false,
            pian_url: '',
            username: '',
        }, 
    });

    async function getCurrentValues() {
        const { setValue } = methods;
        setLoading(true);
        setShowWarning(false);
        setError(null);
    
        try {
          const response = await dispatch(getPianpoolSettings());
          setValue('enable_pool', response.enable || 'false');
          setValue('pian_url', response.pian_url || '');
          setValue('username', response.username || '');
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
    }

    useEffect(() => {
        getCurrentValues();
    }, []); // eslint-disable-line

    async function handleSaveSettings(values: FormData) {
        const { enable_pool, pian_url, username} = values;
        setError(null);
        console.log(values);

        try {
            await dispatch(setPianpoolSettings(enable_pool, pian_url,username));
        } catch (error) {
            setError(error);
        }
    }

    return (
        <LayoutMain
        title={(
            <>
            <Link to="/dashboard/plot" color="textPrimary">
                <Trans>Pianpool</Trans>
            </Link>
            </>
        )}
        >
        <Flex flexDirection="column" gap={3}>
        <Form
            methods={methods}
            onSubmit={handleSaveSettings}
        >
            <Grid>
            <FormControl
              variant="outlined"
            >
            <Select name="enable_pool">
                <MenuItem value="true" > Enable </MenuItem>
                <MenuItem value="false" > Disable </MenuItem>
            </Select>
            </FormControl>
            </Grid>
            <Grid>
            <StyledTextField
                label={<Trans>Pianpool URL</Trans>}
                name="pian_url"
                variant="filled"
            />
            <StyledTextField
                label={<Trans>Username</Trans>}
                name="username"
                variant="filled"
            />
            </Grid>
            <Container maxWidth="xs">
                <Button type="submit" autoFocus color="primary">
                    <Trans>Save</Trans>
                </Button>
            </Container>
        </Form>

        </Flex>
        </LayoutMain>
    );
}
