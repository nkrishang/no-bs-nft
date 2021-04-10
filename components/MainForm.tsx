import React, { useEffect, useState } from 'react';

import {
  Button,
  Stack,
  Center,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Textarea,
  Flex,
  Image,
  Spinner,
  Text
} from '@chakra-ui/react';

import { ContentWrapper } from './ContentWrapper';
import UploadForm from './UploadForm';

function DeployForm(): JSX.Element {

  return (
    <>
      <ContentWrapper>
        <Center className="mt-8">
          <Stack>

            <label htmlFor="collection-name">Collection name</label>
            <Input id="collection-name" placeholder="E.g. 'Crypto punks'"/>

            <label htmlFor="collection-name">Collection symbol</label>
            <Input id="collection-symbol" placeholder="E.g. 'PUNKS'"/>

            <Button>
              Create collection
            </Button>
          </Stack>    
        </Center>
      </ContentWrapper>
    </>
  )
}

export default function MainForm(): JSX.Element {

  return (
    <Tabs isFitted variant="enclosed" width="900px" mb="40px">
      <TabList>
        <Tab> Deploy your NFT collection</Tab>
        <Tab>Upload media to your collection</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <DeployForm />
        </TabPanel>
        <TabPanel>
          <UploadForm uploadMoment={() => {}}/>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}