import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  VStack,
  Image,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader
} from '@chakra-ui/react';
import { FaLeaf, FaCheck } from 'react-icons/fa';

const strainGuide = [
  {
    type: 'CBD-Rich',
    description: 'High in CBD, low in THC. Ideal for therapeutic benefits without psychoactive effects.',
    benefits: ['Anxiety Relief', 'Pain Management', 'Inflammation Reduction'],
    bestFor: ['First-time users', 'Daytime use', 'Therapeutic purposes']
  },
  {
    type: 'Balanced',
    description: 'Equal ratios of CBD and THC. Provides balanced therapeutic and mild psychoactive effects.',
    benefits: ['Stress Relief', 'Mood Enhancement', 'Sleep Aid'],
    bestFor: ['Experienced users', 'Evening use', 'Relaxation']
  },
  {
    type: 'THC-Free',
    description: 'Contains no THC. Perfect for those who want to avoid any psychoactive effects.',
    benefits: ['Clear-headed Relief', 'No Psychoactive Effects', 'Legal in Most Areas'],
    bestFor: ['Professional use', 'Athletes', 'CBD purists']
  }
];

const commonQuestions = [
  {
    question: 'What is CBD?',
    answer: 'CBD (Cannabidiol) is a naturally occurring compound found in the cannabis plant. Unlike THC, CBD is non-psychoactive and won\'t make you feel "high". It\'s known for its potential therapeutic benefits.'
  },
  {
    question: 'How does CBD work?',
    answer: 'CBD interacts with your body\'s endocannabinoid system (ECS), which helps regulate various functions including sleep, mood, pain, and immune response. CBD can help maintain balance in these systems.'
  },
  {
    question: 'Will CBD show up on a drug test?',
    answer: 'Pure CBD products with zero THC should not show up on drug tests, as these tests typically look for THC. However, full-spectrum CBD products may contain trace amounts of THC.'
  },
  {
    question: 'How do I choose the right CBD product?',
    answer: 'Consider factors like your desired effects, preferred consumption method, and dosage needs. Start with a low dose and gradually increase until you find what works for you.'
  }
];

export const EducationPage = () => {
  return (
    <Container maxW="container.xl" py={8}>
      {/* Hero Section */}
      <VStack spacing={6} textAlign="center" mb={12}>
        <Heading as="h1" size="2xl">
          CBD Education Center
        </Heading>
        <Text fontSize="xl" color="gray.600">
          Your comprehensive guide to understanding CBD products and their benefits
        </Text>
      </VStack>

      {/* Strain Guide */}
      <Box mb={12}>
        <Heading as="h2" size="xl" mb={6}>
          Strain Guide
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {strainGuide.map((strain) => (
            <Card key={strain.type}>
              <CardHeader>
                <Heading size="md">{strain.type}</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Text>{strain.description}</Text>
                  <Box>
                    <Text fontWeight="bold" mb={2}>Benefits:</Text>
                    <List spacing={2}>
                      {strain.benefits.map((benefit) => (
                        <ListItem key={benefit}>
                          <ListIcon as={FaCheck} color="green.500" />
                          {benefit}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>Best For:</Text>
                    <List spacing={2}>
                      {strain.bestFor.map((use) => (
                        <ListItem key={use}>
                          <ListIcon as={FaLeaf} color="green.500" />
                          {use}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* FAQ Section */}
      <Box mb={12}>
        <Heading as="h2" size="xl" mb={6}>
          Common Questions
        </Heading>
        <Accordion allowMultiple>
          {commonQuestions.map((item, index) => (
            <AccordionItem key={index}>
              <h3>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="semibold">
                    {item.question}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h3>
              <AccordionPanel pb={4}>
                {item.answer}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>

      {/* Dosage Guide */}
      <Box mb={12}>
        <Heading as="h2" size="xl" mb={6}>
          Dosage Guide
        </Heading>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
          <VStack align="start" spacing={4}>
            <Heading size="md">Starting with CBD</Heading>
            <Text>
              When starting your CBD journey, it's important to begin with a low dose and gradually
              increase until you find your optimal dosage. This is often called the "Start Low and
              Go Slow" approach.
            </Text>
            <List spacing={3}>
              <ListItem>
                <ListIcon as={FaCheck} color="green.500" />
                Start with 5-10mg CBD per day
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheck} color="green.500" />
                Increase by 5mg every week if needed
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheck} color="green.500" />
                Keep track of effects in a journal
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheck} color="green.500" />
                Consult with healthcare professionals
              </ListItem>
            </List>
          </VStack>
          <Image
            src="https://images.unsplash.com/photo-1611070960566-b8723e1e0c29?w=400"
            alt="CBD Dosage Guide"
            borderRadius="lg"
            objectFit="cover"
          />
        </Grid>
      </Box>
    </Container>
  );
};
