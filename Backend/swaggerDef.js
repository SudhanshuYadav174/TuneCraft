const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Wave Flow Backend API',
    version: '1.0.0',
    description: 'Backend service for a public music streaming platform that provides access to music from YouTube and SoundCloud without requiring user authentication.',
    contact: {
      name: 'Wave Flow Team',
      email: 'support@waveflow.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server'
    },
    {
      url: 'https://api.waveflow.com',
      description: 'Production server'
    }
  ],
  components: {
    schemas: {
      Track: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique track identifier'
          },
          title: {
            type: 'string',
            description: 'Track title'
          },
          artist: {
            type: 'string',
            description: 'Artist name'
          },
          thumbnail: {
            type: 'string',
            format: 'uri',
            description: 'Track thumbnail URL'
          },
          duration: {
            type: 'integer',
            description: 'Track duration in seconds'
          },
          publishedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Publication date'
          },
          viewCount: {
            type: 'integer',
            description: 'View count (YouTube) or play count (SoundCloud)'
          },
          likeCount: {
            type: 'integer',
            description: 'Number of likes'
          },
          source: {
            type: 'string',
            enum: ['youtube', 'soundcloud'],
            description: 'Platform source'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Track tags'
          }
        },
        required: ['id', 'title', 'artist', 'source']
      },
      Artist: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Artist identifier'
          },
          username: {
            type: 'string',
            description: 'Artist username'
          },
          displayName: {
            type: 'string',
            description: 'Artist display name'
          },
          avatar: {
            type: 'string',
            format: 'uri',
            description: 'Artist avatar URL'
          },
          followersCount: {
            type: 'integer',
            description: 'Number of followers'
          },
          trackCount: {
            type: 'integer',
            description: 'Number of tracks'
          }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            description: 'Current page number'
          },
          limit: {
            type: 'integer',
            description: 'Number of items per page'
          },
          total: {
            type: 'integer',
            description: 'Total number of items'
          },
          hasMore: {
            type: 'boolean',
            description: 'Whether there are more pages available'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          },
          code: {
            type: 'string',
            description: 'Error code'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Error timestamp'
          }
        },
        required: ['error', 'timestamp']
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      TooManyRequests: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'System',
      description: 'System health and status endpoints'
    },
    {
      name: 'Search',
      description: 'Search for tracks, artists, and albums'
    },
    {
      name: 'Tracks',
      description: 'Track-related operations'
    },
    {
      name: 'Artists',
      description: 'Artist-related operations'
    },
    {
      name: 'Streaming',
      description: 'Audio streaming endpoints'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js'], // Path to the API docs
};

module.exports = swaggerJSDoc(options);