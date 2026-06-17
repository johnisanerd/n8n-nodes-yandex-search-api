import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';

/**
 * Build the Apify Actor input from node parameters.
 * Only the real Actor inputs are sent; the Output / Fields parameters shape the
 * data we return, they are not part of the Actor input. Optional fields are only
 * sent when the user provides a value so the Actor keeps its own defaults.
 */
export function buildActorInput(
	context: IExecuteFunctions,
	itemIndex: number,
	defaultInput: Record<string, any>,
): Record<string, any> {
	const input: Record<string, any> = {
		...defaultInput,
		text: context.getNodeParameter('text', itemIndex),
		yandex_domain: context.getNodeParameter('yandex_domain', itemIndex),
		max_pages: context.getNodeParameter('max_pages', itemIndex),
		groups_on_page: context.getNodeParameter('groups_on_page', itemIndex),
		sort_mode: context.getNodeParameter('sort_mode', itemIndex),
		period: context.getNodeParameter('period', itemIndex),
	};

	const lang = context.getNodeParameter('lang', itemIndex, '') as string;
	const lr = context.getNodeParameter('lr', itemIndex, -1) as number;

	if (lang) input.lang = lang;
	if (lr >= 0) input.lr = lr;

	return input;
}

const resourceProperties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Search Result',
				value: 'searchResult',
			},
		],
		default: 'searchResult',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['searchResult'],
			},
		},
		options: [
			{
				name: 'Search',
				value: 'search',
				action: 'Search and return organic results',
				description: 'Search and return one item per organic result',
			},
		],
		default: 'search',
	},
];

const actorProperties: INodeProperties[] = [
	{
		displayName: 'Search Query',
		name: 'text',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. machine learning',
		description: 'The query to search for',
		displayOptions: { show: { resource: ['searchResult'], operation: ['search'] } },
	},
	{
		displayName: 'Yandex Domain',
		name: 'yandex_domain',
		type: 'string',
		default: 'yandex.com',
		placeholder: 'e.g. yandex.com',
		description: 'Which Yandex domain to query, for example yandex.com or yandex.ru',
		displayOptions: { show: { resource: ['searchResult'], operation: ['search'] } },
	},
	{
		displayName: 'Language',
		name: 'lang',
		type: 'string',
		default: '',
		placeholder: 'e.g. en',
		description: 'Two-letter language code for the results. Leave empty for the domain default.',
		displayOptions: { show: { resource: ['searchResult'], operation: ['search'] } },
	},
	{
		displayName: 'Region ID',
		name: 'lr',
		type: 'number',
		default: -1,
		typeOptions: { minValue: -1 },
		description: 'Yandex region ID (lr) to localize results. Use -1 to omit.',
		displayOptions: { show: { resource: ['searchResult'], operation: ['search'] } },
	},
	{
		displayName: 'Maximum Pages',
		name: 'max_pages',
		type: 'number',
		default: 2,
		typeOptions: { minValue: 1 },
		description: 'How many result pages to fetch',
		displayOptions: { show: { resource: ['searchResult'], operation: ['search'] } },
	},
	{
		displayName: 'Results per Page',
		name: 'groups_on_page',
		type: 'number',
		default: 10,
		typeOptions: { minValue: 1 },
		description: 'How many results to request per page',
		displayOptions: { show: { resource: ['searchResult'], operation: ['search'] } },
	},
	{
		displayName: 'Sort Mode',
		name: 'sort_mode',
		type: 'options',
		options: [
			{ name: 'Date', value: 'date' },
			{ name: 'Relevance', value: 'relevance' },
		],
		default: 'relevance',
		description: 'How to sort the results',
		displayOptions: { show: { resource: ['searchResult'], operation: ['search'] } },
	},
	{
		displayName: 'Time Period',
		name: 'period',
		type: 'options',
		options: [
			{ name: 'All Time', value: 'all' },
			{ name: 'Last Day', value: 'day' },
			{ name: 'Last Month', value: 'month' },
			{ name: 'Last Two Weeks', value: 'last_two_weeks' },
		],
		default: 'all',
		description: 'Restrict results to a time period',
		displayOptions: { show: { resource: ['searchResult'], operation: ['search'] } },
	},
];

const outputProperties: INodeProperties[] = [
	{
		displayName: 'Output',
		name: 'output',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['searchResult'], operation: ['search'] } },
		options: [
			{
				name: 'Raw',
				value: 'raw',
				description: 'Return every field the API produces for each result',
			},
			{
				name: 'Selected Fields',
				value: 'selected',
				description: 'Choose exactly which fields to return',
			},
			{
				name: 'Simplified',
				value: 'simplified',
				description: 'Return a compact set of the most useful result fields',
			},
		],
		default: 'simplified',
		description: 'How much data to return for each result',
	},
	{
		displayName: 'Fields to Include',
		name: 'fields',
		type: 'multiOptions',
		displayOptions: {
			show: { resource: ['searchResult'], operation: ['search'], output: ['selected'] },
		},
		options: [
			{ name: 'Displayed Link', value: 'displayed_link' },
			{ name: 'Link', value: 'link' },
			{ name: 'Position', value: 'position' },
			{ name: 'Sitelinks', value: 'sitelinks' },
			{ name: 'Snippet', value: 'snippet' },
			{ name: 'Title', value: 'title' },
		],
		default: ['position', 'title', 'link', 'snippet'],
		description: 'Which fields to return when Output is set to Selected Fields',
	},
];

const authenticationProperties: INodeProperties[] = [
	{
		displayName: 'Authentication',
		name: 'authentication',
		type: 'options',
		options: [
			{
				name: 'API Key',
				value: 'apifyApi',
			},
			{
				name: 'OAuth2',
				value: 'apifyOAuth2Api',
			},
		],
		default: 'apifyApi',
		description: 'Choose which authentication method to use',
	},
];

export const properties: INodeProperties[] = [
	...resourceProperties,
	...actorProperties,
	...outputProperties,
	...authenticationProperties,
];
