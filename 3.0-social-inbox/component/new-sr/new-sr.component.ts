import { E, I } from '@angular/cdk/keycodes';
import { Location } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { Priority } from 'app/core/enums/Priority';
import { Sentiment } from 'app/core/enums/Sentiment';
import { BrandDetails } from 'app/core/models/accounts/brandsList';
import { ApolloRequest } from 'app/core/models/crm/ApolloRequest';
import { BandhanRequest } from 'app/core/models/crm/BandhanRequest';
import { countryCodeList } from 'app/core/models/crm/CountryCodes';
import { CRMMenu, Datum, FormField } from 'app/core/models/crm/CRMMenu';
import { ExtraMarksRequest } from 'app/core/models/crm/ExtraMarksRequest';
import { FedralRequest } from 'app/core/models/crm/FedralRequest';
import { MagmaRequest } from 'app/core/models/crm/MagmaRequest';
import {
  ApolloRequestType,
  BTCCrmRequestType,
} from 'app/core/models/crm/NonTelecomRequest';
import { OctafxRequest } from 'app/core/models/crm/OctafxRequest';
import { RecrmRequest } from 'app/core/models/crm/RecrmRequest';
import { TataUniRequest } from 'app/core/models/crm/TataUniRequest';
import { TitanRequest } from 'app/core/models/crm/TitanRequest';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { NavigationService } from 'app/core/services/navigation.service';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { CrmService } from 'app/social-inbox/services/crm.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import moment from 'moment';
import { notificationType } from './../../../core/enums/notificationType';
import { CustomSnackbarComponent } from './../../../shared/components/custom-snackbar/custom-snackbar.component';
import { DreamsolRequest } from 'app/core/models/crm/DreamsolRequest';
import { TataCapitalRequest } from 'app/core/models/crm/TataCapitalRequest';
import { DuraflexRequest } from 'app/core/models/crm/DreamsolRequest';
import { TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'app-new-sr',
    templateUrl: './new-sr.component.html',
    styleUrls: ['./new-sr.component.scss'],
    standalone: false
})
export class NewSrComponent implements OnInit, AfterViewInit {
  requestType: BTCCrmRequestType;
  requestTypeTitle: string;
  panelOpenState = false;
  selected = '+91';
  ticketid: string;
  checkoutForm = this._formBuilder.group({});
  public drpdomain: string;
  fields: FormField[];
  actionProcessing: boolean;
  extraMarkCrmRequest: ExtraMarksRequest;
  octaCrmRequest: OctafxRequest;
  dreamsolRequest: DreamsolRequest;
  tataUniCrmGroup: UntypedFormGroup;
  tatauniCrmFlag: boolean;
  tataUniLoader: boolean;
  mobileView: boolean;
  disableButton: boolean;
  userpostLink: string = '';
  newMentionFound: boolean;
  UserProfileurl: string = '';
  selectedCountry: any;
  countryCodeSearchCtrl = new UntypedFormControl('');
  countryCodeListCopy = [];
  dreamsolcrmFlag: boolean=false;
  AttachmentsList:any = []
  txtMaxLength:number
  constructor(
    private _location: Location,
    public dialog: MatDialog,
    public select: MatSelectModule,
    private _postdetailservice: PostDetailService,
    private _filterService: FilterService,
    private _formBuilder: UntypedFormBuilder,
    private _crmService: CrmService,
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<NewSrComponent>,
    private ticketService: TicketsService,
    private navigationService: NavigationService,
    private cdkRef: ChangeDetectorRef,
    private _footericonService: FootericonsService,
    private translate: TranslateService,
    private _ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  @Input() postData: BaseMention;
  @Input() bandhanrequest: BandhanRequest;
  @Input() fedralrequest: FedralRequest;
  @Input() titanrequest: TitanRequest;
  @Input() magmarequest: MagmaRequest;
  @Input() apollorequest: ApolloRequest;
  @Input() crmMenu: CRMMenu;
  @ViewChildren('inputRef') inputRef: QueryList<MatInput>;
  recrmrequest: RecrmRequest;
  tataUnicrmrequest: TataUniRequest;
  tataCapitalRequest: TataCapitalRequest;
  duraflexRequest: DuraflexRequest;
  countryCodeList = [
    {
      country: 'AFG',
      code: 93,
      value: 1,
    },
    {
      country: 'ALA',
      code: 358,
      value: 2,
    },
    {
      country: 'ALB',
      code: 355,
      value: 3,
    },
    {
      country: 'DZA',
      code: 213,
      value: 4,
    },
    {
      country: 'ASM',
      code: 1,
      value: 5,
    },
    {
      country: 'AND',
      code: 376,
      value: 6,
    },
    {
      country: 'AGO',
      code: 244,
      value: 7,
    },
    {
      country: 'AIA',
      code: 1,
      value: 8,
    },
    {
      country: 'ATA',
      code: 672,
      value: 9,
    },
    {
      country: 'ATG',
      code: 1,
      value: 10,
    },
    {
      country: 'ARG',
      code: 54,
      value: 11,
    },
    {
      country: 'ARM',
      code: 374,
      value: 12,
    },
    {
      country: 'ABW',
      code: 297,
      value: 13,
    },
    {
      country: 'AUS',
      code: 61,
      value: 14,
    },
    {
      country: 'AUT',
      code: 43,
      value: 15,
    },
    {
      country: 'AZE',
      code: 994,
      value: 16,
    },
    {
      country: 'BHS',
      code: 1,
      value: 17,
    },
    {
      country: 'BHR',
      code: 973,
      value: 18,
    },
    {
      country: 'BGD',
      code: 880,
      value: 19,
    },
    {
      country: 'BRB',
      code: 1,
      value: 20,
    },
    {
      country: 'BLR',
      code: 375,
      value: 21,
    },
    {
      country: 'BEL',
      code: 32,
      value: 22,
    },
    {
      country: 'BLZ',
      code: 501,
      value: 23,
    },
    {
      country: 'BEN',
      code: 229,
      value: 24,
    },
    {
      country: 'BMU',
      code: 1,
      value: 25,
    },
    {
      country: 'BTN',
      code: 975,
      value: 26,
    },
    {
      country: 'BOL',
      code: 591,
      value: 27,
    },
    {
      country: 'BIH',
      code: 387,
      value: 28,
    },
    {
      country: 'BWA',
      code: 267,
      value: 29,
    },
    {
      country: 'BVT',
      code: 47,
      value: 30,
    },
    {
      country: 'BRA',
      code: 55,
      value: 31,
    },
    {
      country: 'IOT',
      code: 246,
      value: 32,
    },
    {
      country: 'BRN',
      code: 673,
      value: 33,
    },
    {
      country: 'BGR',
      code: 359,
      value: 34,
    },
    {
      country: 'BFA',
      code: 226,
      value: 35,
    },
    {
      country: 'BDI',
      code: 257,
      value: 36,
    },
    {
      country: 'CPV',
      code: 238,
      value: 37,
    },
    {
      country: 'KHM',
      code: 855,
      value: 38,
    },
    {
      country: 'CMR',
      code: 237,
      value: 39,
    },
    {
      country: 'CAN',
      code: 1,
      value: 40,
    },
    {
      country: 'CYM',
      code: 1,
      value: 41,
    },
    {
      country: 'CAF',
      code: 236,
      value: 42,
    },
    {
      country: 'TCD',
      code: 235,
      value: 43,
    },
    {
      country: 'CHL',
      code: 56,
      value: 44,
    },
    {
      country: 'CHN',
      code: 86,
      value: 45,
    },
    {
      country: 'CXR',
      code: 61,
      value: 46,
    },
    {
      country: 'CCK',
      code: 61,
      value: 47,
    },
    {
      country: 'COL',
      code: 57,
      value: 48,
    },
    {
      country: 'COM',
      code: 269,
      value: 49,
    },
    {
      country: 'COG',
      code: 242,
      value: 50,
    },
    {
      country: 'COK',
      code: 682,
      value: 51,
    },
    {
      country: 'CRI',
      code: 506,
      value: 52,
    },
    {
      country: 'CIV',
      code: 225,
      value: 53,
    },
    {
      country: 'HRV',
      code: 385,
      value: 54,
    },
    {
      country: 'CUB',
      code: 53,
      value: 55,
    },
    {
      country: 'CYP',
      code: 357,
      value: 56,
    },
    {
      country: 'CZE',
      code: 420,
      value: 57,
    },
    {
      country: 'DNK',
      code: 45,
      value: 58,
    },
    {
      country: 'DJI',
      code: 253,
      value: 59,
    },
    {
      country: 'DMA',
      code: 1,
      value: 60,
    },
    {
      country: 'DOM',
      code: 1,
      value: 61,
    },
    {
      country: 'CD',
      code: 243,
      value: 62,
    },
    {
      country: 'ECU',
      code: 593,
      value: 63,
    },
    {
      country: 'EGY',
      code: 20,
      value: 64,
    },
    {
      country: 'SLV',
      code: 503,
      value: 65,
    },
    {
      country: 'GNQ',
      code: 240,
      value: 66,
    },
    {
      country: 'ERI',
      code: 291,
      value: 67,
    },
    {
      country: 'EST',
      code: 372,
      value: 68,
    },
    {
      country: 'SWZ',
      code: 268,
      value: 69,
    },
    {
      country: 'ETH',
      code: 251,
      value: 70,
    },
    {
      country: 'FLK',
      code: 500,
      value: 71,
    },
    {
      country: 'FRO',
      code: 298,
      value: 72,
    },
    {
      country: 'FJI',
      code: 679,
      value: 73,
    },
    {
      country: 'FIN',
      code: 358,
      value: 74,
    },
    {
      country: 'FRA',
      code: 33,
      value: 75,
    },
    {
      country: 'GUF',
      code: 594,
      value: 76,
    },
    {
      country: 'PYF',
      code: 689,
      value: 77,
    },
    {
      country: 'ATF',
      code: 262,
      value: 78,
    },
    {
      country: 'GAB',
      code: 241,
      value: 79,
    },
    {
      country: 'GMB',
      code: 220,
      value: 80,
    },
    {
      country: 'GEO',
      code: 995,
      value: 81,
    },
    {
      country: 'DEU',
      code: 49,
      value: 82,
    },
    {
      country: 'GHA',
      code: 233,
      value: 83,
    },
    {
      country: 'GIB',
      code: 350,
      value: 84,
    },
    {
      country: 'GRC',
      code: 30,
      value: 85,
    },
    {
      country: 'GRL',
      code: 299,
      value: 86,
    },
    {
      country: 'GRD',
      code: 1,
      value: 87,
    },
    {
      country: 'GLP',
      code: 590,
      value: 88,
    },
    {
      country: 'GUM',
      code: 1,
      value: 89,
    },
    {
      country: 'GTM',
      code: 502,
      value: 90,
    },
    {
      country: 'GGY',
      code: 44,
      value: 91,
    },
    {
      country: 'GIN',
      code: 224,
      value: 92,
    },
    {
      country: 'GNB',
      code: 245,
      value: 93,
    },
    {
      country: 'GUY',
      code: 592,
      value: 94,
    },
    {
      country: 'HTI',
      code: 509,
      value: 95,
    },
    {
      country: 'VAT',
      code: 39,
      value: 96,
    },
    {
      country: 'HND',
      code: 504,
      value: 97,
    },
    {
      country: 'HKG',
      code: 852,
      value: 98,
    },
    {
      country: 'HUN',
      code: 36,
      value: 99,
    },
    {
      country: 'ISL',
      code: 354,
      value: 100,
    },
    {
      country: 'IND',
      code: 91,
      value: 101,
    },
    {
      country: 'IDN',
      code: 62,
      value: 102,
    },
    {
      country: 'IRN',
      code: 98,
      value: 103,
    },
    {
      country: 'IRQ',
      code: 964,
      value: 104,
    },
    {
      country: 'IRL',
      code: 353,
      value: 105,
    },
    {
      country: 'IMN',
      code: 44,
      value: 106,
    },
    {
      country: 'ISR',
      code: 972,
      value: 107,
    },
    {
      country: 'ITA',
      code: 39,
      value: 108,
    },
    {
      country: 'JAM',
      code: 1,
      value: 109,
    },
    {
      country: 'JPN',
      code: 81,
      value: 110,
    },
    {
      country: 'JEY',
      code: 44,
      value: 111,
    },
    {
      country: 'JOR',
      code: 962,
      value: 112,
    },
    {
      country: 'KEN',
      code: 254,
      value: 113,
    },
    {
      country: 'KIR',
      code: 686,
      value: 114,
    },
    {
      country: 'PRK',
      code: 850,
      value: 115,
    },
    {
      country: 'KOR',
      code: 82,
      value: 116,
    },
    {
      country: 'KWT',
      code: 965,
      value: 117,
    },
    {
      country: 'KGZ',
      code: 996,
      value: 118,
    },
    {
      country: 'LAO',
      code: 856,
      value: 119,
    },
    {
      country: 'LVA',
      code: 371,
      value: 120,
    },
    {
      country: 'LBN',
      code: 961,
      value: 121,
    },
    {
      country: 'LSO',
      code: 266,
      value: 122,
    },
    {
      country: 'LBR',
      code: 231,
      value: 123,
    },
    {
      country: 'LBY',
      code: 218,
      value: 124,
    },
    {
      country: 'LIE',
      code: 423,
      value: 125,
    },
    {
      country: 'LTU',
      code: 370,
      value: 126,
    },
    {
      country: 'LUX',
      code: 352,
      value: 127,
    },
    {
      country: 'MKD',
      code: 853,
      value: 128,
    },
    {
      country: 'MDG',
      code: 261,
      value: 129,
    },
    {
      country: 'MWI',
      code: 265,
      value: 130,
    },
    {
      country: 'MYS',
      code: 60,
      value: 131,
    },
    {
      country: 'MDV',
      code: 960,
      value: 132,
    },
    {
      country: 'MLI',
      code: 223,
      value: 133,
    },
    {
      country: 'MLT',
      code: 356,
      value: 134,
    },
    {
      country: 'MHL',
      code: 692,
      value: 135,
    },
    {
      country: 'MTQ',
      code: 596,
      value: 136,
    },
    {
      country: 'MRT',
      code: 222,
      value: 137,
    },
    {
      country: 'MUS',
      code: 230,
      value: 138,
    },
    {
      country: 'MYT',
      code: 262,
      value: 139,
    },
    {
      country: 'MEX',
      code: 52,
      value: 140,
    },
    {
      country: 'FSM',
      code: 691,
      value: 141,
    },
    {
      country: 'MDA',
      code: 373,
      value: 142,
    },
    {
      country: 'MCO',
      code: 377,
      value: 143,
    },
    {
      country: 'MNG',
      code: 976,
      value: 144,
    },
    {
      country: 'MNE',
      code: 382,
      value: 145,
    },
    {
      country: 'MSR',
      code: 1,
      value: 146,
    },
    {
      country: 'MAR',
      code: 212,
      value: 147,
    },
    {
      country: 'MOZ',
      code: 258,
      value: 148,
    },
    {
      country: 'MMR',
      code: 95,
      value: 149,
    },
    {
      country: 'NAM',
      code: 264,
      value: 150,
    },
    {
      country: 'NRU',
      code: 674,
      value: 151,
    },
    {
      country: 'NPL',
      code: 977,
      value: 152,
    },
    {
      country: 'NLD',
      code: 31,
      value: 153,
    },
    {
      country: 'ANT',
      code: 599,
      value: 154,
    },
    {
      country: 'NCL',
      code: 687,
      value: 155,
    },
    {
      country: 'NZL',
      code: 64,
      value: 156,
    },
    {
      country: 'NIC',
      code: 505,
      value: 157,
    },
    {
      country: 'NER',
      code: 227,
      value: 158,
    },
    {
      country: 'NGA',
      code: 234,
      value: 159,
    },
    {
      country: 'NIU',
      code: 683,
      value: 160,
    },
    {
      country: 'NFK',
      code: 672,
      value: 161,
    },
    {
      country: 'MK',
      code: 389,
      value: 162,
    },
    {
      country: 'MNP',
      code: 1,
      value: 163,
    },
    {
      country: 'NOR',
      code: 47,
      value: 164,
    },
    {
      country: 'OMN',
      code: 968,
      value: 165,
    },
    {
      country: 'PAK',
      code: 92,
      value: 166,
    },
    {
      country: 'PLW',
      code: 680,
      value: 167,
    },
    {
      country: 'PSE',
      code: 970,
      value: 168,
    },
    {
      country: 'PAN',
      code: 507,
      value: 169,
    },
    {
      country: 'PNG',
      code: 675,
      value: 170,
    },
    {
      country: 'PRY',
      code: 595,
      value: 171,
    },
    {
      country: 'PER',
      code: 51,
      value: 172,
    },
    {
      country: 'PHL',
      code: 63,
      value: 173,
    },
    {
      country: 'PCN',
      code: 64,
      value: 174,
    },
    {
      country: 'POL',
      code: 48,
      value: 175,
    },
    {
      country: 'PRT',
      code: 351,
      value: 176,
    },
    {
      country: 'PRI',
      code: 1,
      value: 177,
    },
    {
      country: 'QAT',
      code: 974,
      value: 178,
    },
    {
      country: 'REU',
      code: 262,
      value: 179,
    },
    {
      country: 'ROU',
      code: 40,
      value: 180,
    },
    {
      country: 'RUS',
      code: 7,
      value: 181,
    },
    {
      country: 'RWA',
      code: 250,
      value: 182,
    },
    {
      country: 'SHN',
      code: 290,
      value: 183,
    },
    {
      country: 'KNA',
      code: 1,
      value: 184,
    },
    {
      country: 'LCA',
      code: 1,
      value: 185,
    },
    {
      country: 'SPM',
      code: 508,
      value: 186,
    },
    {
      country: 'VCT',
      code: 1,
      value: 187,
    },
    {
      country: 'WSM',
      code: 685,
      value: 188,
    },
    {
      country: 'SMR',
      code: 378,
      value: 189,
    },
    {
      country: 'STP',
      code: 239,
      value: 190,
    },
    {
      country: 'SAU',
      code: 966,
      value: 191,
    },
    {
      country: 'SEN',
      code: 221,
      value: 192,
    },
    {
      country: 'SRB',
      code: 381,
      value: 193,
    },
    {
      country: 'SYC',
      code: 248,
      value: 194,
    },
    {
      country: 'SLE',
      code: 232,
      value: 195,
    },
    {
      country: 'SGP',
      code: 65,
      value: 196,
    },
    {
      country: 'SVK',
      code: 421,
      value: 197,
    },
    {
      country: 'SVN',
      code: 386,
      value: 198,
    },
    {
      country: 'SLB',
      code: 677,
      value: 199,
    },
    {
      country: 'SOM',
      code: 252,
      value: 200,
    },
    {
      country: 'ZAF',
      code: 27,
      value: 201,
    },
    {
      country: 'SGS',
      code: 500,
      value: 202,
    },
    {
      country: 'ESP',
      code: 34,
      value: 203,
    },
    {
      country: 'LKA',
      code: 94,
      value: 204,
    },
    {
      country: 'SDN',
      code: 249,
      value: 205,
    },
    {
      country: 'SUR',
      code: 597,
      value: 206,
    },
    {
      country: 'SJM',
      code: 47,
      value: 207,
    },
    {
      country: 'SWE',
      code: 46,
      value: 208,
    },
    {
      country: 'CHE',
      code: 41,
      value: 209,
    },
    {
      country: 'SYR',
      code: 963,
      value: 210,
    },
    {
      country: 'TWN',
      code: 886,
      value: 211,
    },
    {
      country: 'TJK',
      code: 992,
      value: 212,
    },
    {
      country: 'TZA',
      code: 255,
      value: 213,
    },
    {
      country: 'THA',
      code: 66,
      value: 214,
    },
    {
      country: 'TLS',
      code: 670,
      value: 215,
    },
    {
      country: 'TGO',
      code: 228,
      value: 216,
    },
    {
      country: 'TKL',
      code: 690,
      value: 217,
    },
    {
      country: 'TON',
      code: 676,
      value: 218,
    },
    {
      country: 'TTO',
      code: 1,
      value: 219,
    },
    {
      country: 'TUN',
      code: 216,
      value: 220,
    },
    {
      country: 'TUR',
      code: 90,
      value: 221,
    },
    {
      country: 'TKM',
      code: 993,
      value: 222,
    },
    {
      country: 'TCA',
      code: 1,
      value: 223,
    },
    {
      country: 'TUV',
      code: 688,
      value: 224,
    },
    {
      country: 'UGA',
      code: 256,
      value: 225,
    },
    {
      country: 'UKR',
      code: 380,
      value: 226,
    },
    {
      country: 'ARE',
      code: 971,
      value: 227,
    },
    {
      country: 'GBR',
      code: 44,
      value: 228,
    },
    {
      country: 'USA',
      code: 1,
      value: 229,
    },
    {
      country: 'UMI',
      code: 699,
      value: 230,
    },
    {
      country: 'URY',
      code: 598,
      value: 231,
    },
    {
      country: 'UZB',
      code: 998,
      value: 232,
    },
    {
      country: 'VUT',
      code: 678,
      value: 233,
    },
    {
      country: 'VEN',
      code: 58,
      value: 234,
    },
    {
      country: 'VNM',
      code: 84,
      value: 235,
    },
    {
      country: 'VG',
      code: 1,
      value: 236,
    },
    {
      country: 'VIR',
      code: 1,
      value: 237,
    },
    {
      country: 'WLF',
      code: 681,
      value: 238,
    },
    {
      country: 'ESH',
      code: 212,
      value: 239,
    },
    {
      country: 'YEM',
      code: 967,
      value: 240,
    },
    {
      country: 'ZMB',
      code: 260,
      value: 241,
    },
    {
      country: 'ZWE',
      code: 263,
      value: 242,
    },
  ];
  source_name:string;
  type_name:string;
  unit_name_displayname:string;
  selectedCountryLength: number;
  noMatchFound: boolean = false;
  RecordTypeId:string;
  ngOnInit(): void {
    this.countryCodeListCopy = this.countryCodeList;
    for (let country of this.countryCodeList) {
      if (country.code == 91) {
        this.selectedCountry = country;
      }
    }
    this.tataUniCrmGroup = this._formBuilder.group({
      email: [this.data?.author?.locoBuzzCRMDetails?.emailID ? this.data?.author?.locoBuzzCRMDetails?.emailID : '', [Validators.required]],
      mobileNumber: [
        this.data?.author?.locoBuzzCRMDetails?.phoneNumber ? this.data?.author?.locoBuzzCRMDetails?.phoneNumber : '',
        [
          Validators.required,
          Validators.pattern('^[0][1-9][0-9]{9}$|^[1-9][0-9]{9}$'),
        ],
      ],
      type: [1],
      countrycode: [91],
    });
    this.requestType = this._crmService.requestType;
    this.requestTypeTitle = this._crmService.requestTypeTitle;
    this.crmMenu = this._crmService.crmmenu;
    const selectedrequest = this.crmMenu.data.formJson.filter(
      (x) => +x.RequestType === this.requestType
    );

    this.postData = this._postdetailservice.postObj;
    const postCRMdata = this._filterService.fetchedBrandData.find(
      (brand: BrandList) => +brand.brandID === this.postData.brandInfo.brandID
    );
    this.bandhanrequest = this._crmService.bandhanrequest;
    this.fedralrequest = this._crmService.fedralrequest;
    this.titanrequest = this._crmService.titanrequest;
    this.magmarequest = this._crmService.magmarequest;
    this.apollorequest = this._crmService.apollorequest;
    this.recrmrequest = this._crmService.rercrmRequest;
    this.extraMarkCrmRequest = this._crmService.extramarksRequest;
    this.octaCrmRequest = this._crmService.octafxCrmRequest;
    this.dreamsolRequest = this._crmService.dreamsolRequest;
    this.tataUnicrmrequest = this._crmService.tataUniRequest;
    this.newMentionFound = this._crmService.newMentionFound;
    this.tataCapitalRequest = this._crmService.tataCapitalRequest;
    this.duraflexRequest = this._crmService.duraflexRequest;
    if (selectedrequest) {
      this.fields = selectedrequest[0].FormFields;
      if (postCRMdata.crmClassName.toLowerCase() === 'dreamsolcrm'){
        this.fields = this.fields.filter((r) => !r.Field.includes('gmb_') && r.Field !='submitted_on')

      }
      if (postCRMdata.crmClassName.toLowerCase() === 'tatacapitalcrm'){
        this.fields = this.fields.filter((r) => !r.Field.includes('SubmittedOn'))
        const attachmentIndex = this.fields.findIndex(item => item.Label === "Attachments");

        // Move the item to the last position if found
        if (attachmentIndex !== -1) {
          const attachmentItem = this.fields.splice(attachmentIndex, 1)[0];
          this.fields.push(attachmentItem);
        }
      }

      for (const field of this.fields) {
        const objname = field.Field.toString().toLowerCase();
        const checkdependant = this.fields.find(
          (x) => x.DependentField === field.Field
        );
        const isdisabled =
          checkdependant && !this.newMentionFound ? true : false;

        this.checkoutForm.addControl(objname, new UntypedFormControl());

        if (postCRMdata.crmClassName.toLowerCase() === 'bandhancrm') {
          this.checkoutForm.controls[objname].setValue(
            this.bandhanrequest[field.Field],
            Validators.required
          );
          if (isdisabled) {
            this.checkoutForm.controls[objname].disable();
          }
        } else if (postCRMdata.crmClassName.toLowerCase() === 'fedralcrm') {
          if (this.newMentionFound) {
            if (field.Field == 'Location') {
              const locationDetails = this.fields.find(
                (obj) => obj.Field == 'Location'
              );
              let locationCode = locationDetails.Data.find(
                (obj) => obj.Value == this.fedralrequest[field.Field]
              ).Key;
              this.checkoutForm.controls[objname].setValue(
                locationCode,
                Validators.required
              );
            } else if (field.Field == 'SubSubCategory') {
              const categoryDetails = this.fields.find(
                (obj) => obj.Field == 'Category'
              );
              let categoryList = categoryDetails.Data.find(
                (obj) => obj.Key == this.fedralrequest['Category']
              );
              let subCategoryList;
              if (categoryList) {
                subCategoryList = categoryList.DependentFieldValue.find(
                  (obj) => obj.Key == this.fedralrequest['SubCategory']
                );
              }
              let subSubCategoryName;
              if (categoryList) {
                subSubCategoryName = subCategoryList.DependentFieldValue.find(
                  (obj) => obj.Value == this.fedralrequest['SubSubCategory']
                ).Key;
              }
              // subSubCategoryName = subCategoryList.find((obj) => obj.Key == this.fedralrequest['Category']).Key
              this.checkoutForm.controls[objname].setValue(
                subSubCategoryName ? subSubCategoryName : '',
                Validators.required
              );
            } else {
              this.checkoutForm.controls[objname].setValue(
                this.fedralrequest[field.Field],
                Validators.required
              );
            }
          } else {
            this.checkoutForm.controls[objname].setValue(
              this.fedralrequest[field.Field],
              Validators.required
            );
          }
          if (isdisabled) {
            this.checkoutForm.controls[objname].disable();
          }
        } else if (postCRMdata.crmClassName.toLowerCase() === 'titancrm') {
          this.checkoutForm.controls[objname].setValue(
            this.titanrequest[field.Field],
            Validators.required
          );
          if (isdisabled) {
            this.checkoutForm.controls[objname].disable();
          }
        } else if (postCRMdata.crmClassName.toLowerCase() === 'magmacrm') {
          this.checkoutForm.controls[objname].setValue(
            this.magmarequest[field.Field],
            Validators.required
          );
          if (isdisabled) {
            this.checkoutForm.controls[objname].disable();
          }
        } else if (postCRMdata.crmClassName.toLowerCase() === 'apollocrm') {
          let value = '';
          if (this.newMentionFound) {
            if (
              field.Field == 'LeadName' &&
              this.apollorequest[field.Field.replace(/ +/g, '')]
            ) {
              const leadNameList = this.fields.find(
                (obj) => obj.Field == 'LeadName'
              ).Data;
              value = leadNameList.find(
                (obj) =>
                  obj.Value ==
                  this.apollorequest[field.Field.replace(/ +/g, '')]
              ).Key;
            } else if (field.Field == 'City') {
              // const CityList = this.fields.find((obj) => obj.Field == 'City').Data
              // value = CityList.find((obj) => obj.Value == this.apollorequest[field.Field]).Key
              value = this.apollorequest.CityId;
            } else if (field.Field == 'Hospital') {
              // const CityList = this.fields.find((obj) => obj.Field == 'Hospital').Data
              // value = CityList.find((obj) => obj.Value == this.apollorequest[field.Field]).Key
              value = this.apollorequest.HospitalId;
            } else if (field.Field == 'Doctor') {
              // const CityList = this.fields.find((obj) => obj.Field == 'Doctor').Data
              // value = CityList.find((obj) => obj.Value == this.apollorequest[field.Field]).Key
              value = this.apollorequest.DoctorId;
            } else if (field.Field == 'Speciality') {
              // const CityList = this.fields.find((obj) => obj.Field == 'Speciality').Data
              // value = CityList.find((obj) => obj.Value == this.apollorequest[field.Field]).Key
              value = this.apollorequest.SpecialityId;
            } else if (field.Field == 'Attribute') {
              // const CityList = this.fields.find((obj) => obj.Field == 'Speciality').Data
              // value = CityList.find((obj) => obj.Value == this.apollorequest[field.Field]).Key
              value = this.apollorequest.AttributeId;
            } else if (field.Field == 'Category') {
              value = this.apollorequest.CategoryId;
            } else if (field.Field == 'SubCategory') {
              value = this.apollorequest.SubCategoryId;
            } else if (
              field.Field == 'CaseType' &&
              this.apollorequest[field.Field]
            ) {
              const CaseTypeList = this.fields.find(
                (obj) => obj.Field == 'CaseType'
              ).Data;
              value = CaseTypeList.find(
                (obj) => obj.Value == this.apollorequest[field.Field]
              ).Key;
            } else {
              value = this.apollorequest[field.Field.replace(/ +/g, '')];
            }
          } else {
            value = this.apollorequest[field.Field.replace(/ +/g, '')];
          }

          this.checkoutForm.controls[objname].setValue(
            value,
            Validators.required
          );
          if (isdisabled) {
            this.checkoutForm.controls[objname].disable();
          }
        } else if (postCRMdata.crmClassName.toLowerCase() === 'recrm') {
          this.checkoutForm.controls[objname].setValue(
            this.recrmrequest[field.Field],
            Validators.required
          );
          if (isdisabled) {
            this.checkoutForm.controls[objname].disable();
          }
        } else if (postCRMdata.crmClassName.toLowerCase() === 'tataunicrm') {
          let value = '';
          if (this.newMentionFound) {
            if (field.Label == 'Brand' && this.tataUnicrmrequest[field.Field]) {
              const BrandDetailsList = this.fields.find(
                (obj) => obj.Label == 'Brand'
              ).Data;
              value = BrandDetailsList.find(
                (obj) => obj.Value == this.tataUnicrmrequest[field.Field]
              ).Key;
            }
            if (
              field.Label == 'Category' &&
              this.tataUnicrmrequest[field.Field]
            ) {
              const categoryDetailsList = this.fields.find(
                (obj) => obj.Label == 'Category'
              ).Data;
              value = categoryDetailsList.find(
                (obj) => obj.Value == this.tataUnicrmrequest[field.Field]
              ).Key;
            }
            if (
              field.Label == 'Issue Category' &&
              this.tataUnicrmrequest[field.Field]
            ) {
              const issueCategoryDetailsList = this.fields.find(
                (obj) => obj.Label == 'Issue Category'
              ).Data;
              value = issueCategoryDetailsList.find(
                (obj) => obj.Value == this.tataUnicrmrequest[field.Field]
              ).Key;
            }
            if (
              field.Label == 'Issue Classification' &&
              this.tataUnicrmrequest[field.Field]
            ) {
              const issueclassificationDetailsList = this.fields.find(
                (obj) => obj.Label == 'Issue Classification'
              ).Data;
              value = issueclassificationDetailsList.find(
                (obj) => obj.Value == this.tataUnicrmrequest[field.Field]
              ).Key;
            }
            if (field.Label == 'Type' && this.tataUnicrmrequest[field.Field]) {
              const typeDetailsList = this.fields.find(
                (obj) => obj.Label == 'Type'
              ).Data;
              value = typeDetailsList.find(
                (obj) => obj.Value == this.tataUnicrmrequest[field.Field]
              ).Key;
            }
            if (
              field.Label == 'Source' &&
              this.tataUnicrmrequest[field.Field]
            ) {
              const sourceDetailsList = this.fields.find(
                (obj) => obj.Label == 'Source'
              ).Data;
              value = sourceDetailsList.find(
                (obj) => obj.Value == this.tataUnicrmrequest[field.Field]
              ).Key;
            }
          }

          if (field.Field=='Source')
          {
            const locationurl = window.location.host;
            let codeId=''
            if (locationurl.includes('demo.locobuzz.com') || locationurl.includes('locobuzzng-uat-aws.locobuzz.com'))
            {
              field.Data = [{ Key: '115', Value: 'Social Media', DependentFieldValue :null}]
              codeId='115';
            }
            if (locationurl.includes('cx.locobuzz.com')) {
              codeId = '121';
              field.Data = [{ Key: '121', Value: 'Social Media', DependentFieldValue: null }]
            }
            this.checkoutForm.controls[objname].setValue(
              codeId,
              Validators.required
            );
            this.checkoutForm.controls[objname].disable();
          }else{
            this.checkoutForm.controls[objname].setValue(
              value ? value : this.tataUnicrmrequest[field.Field],
              Validators.required
            );
          }
          if (isdisabled) {
            this.checkoutForm.controls[objname].disable();
          }
        } else if (postCRMdata.crmClassName.toLowerCase() === 'extramarkscrm') {
          this.checkoutForm.controls[objname].setValue(
            this.extraMarkCrmRequest[field.Field],
            Validators.required
          );
          if (isdisabled) {
            this.checkoutForm.controls[objname].disable();
          }
        } else if (postCRMdata.crmClassName.toLowerCase() === 'octafxcrm') {
          this.checkoutForm.controls[objname].setValue(
            this.octaCrmRequest[field.Field],
            Validators.required
          );
          if (isdisabled) {
            this.checkoutForm.controls[objname].disable();
          }
        } else if (postCRMdata.crmClassName.toLowerCase() === 'dreamsolcrm'){
          this.dreamsolcrmFlag = true
          this.newMentionFound = false;
          switch (field.Field) {
            case 'comments':
              this.dreamsolRequest[field.Field] = this.dreamsolRequest['ConversationLog']
              break;
            case 'unit_name':
              field.Data.forEach((r) => {
                if (r.Value.toLowerCase() === this.dreamsolRequest['unit_name_displayname']?.toLowerCase())
                  this.dreamsolRequest[field.Field] = r.Key
              })
              break;
            case 'source':
              field.Data.forEach((r) => {
                if (r.Value.toLowerCase()?.trim() === this.dreamsolRequest['source_name']?.toLowerCase()){
                  this.dreamsolRequest[field.Field] = r.Key
                } else if (this.dreamsolRequest['source_name']?.toLowerCase() == 'googlemyreview'){
                  this.dreamsolRequest[field.Field] = 'GOO'
                } else if (r.Key.toLowerCase()?.trim() == this.dreamsolRequest['source']?.toLowerCase() ){
                  this.dreamsolRequest['source_name'] = r.Value
                }
              })
              break;
            case 'type':
              field.Data.forEach((r) => {
                if (r.Value.toLowerCase() === this.dreamsolRequest['type_name']?.toLowerCase())
                  this.dreamsolRequest[field.Field] = r.Key
              })
              break;
            case 'mobile_number':
              this.dreamsolRequest[field.Field] = this.dreamsolRequest['MobileNumber']?.substring(this.dreamsolRequest['MobileNumber']?.length - 10) ? this.dreamsolRequest['MobileNumber']?.substring(this.dreamsolRequest['MobileNumber']?.length - 10) : this.data?.mobile?.substring(this.data?.mobile?.length - 10);
              break;
            case 'email_id':
              this.dreamsolRequest[field.Field] = this.dreamsolRequest['EmailAddress'] ? this.dreamsolRequest['EmailAddress'] : this.data?.email;
              break;
            case 'UHID':
              this.dreamsolRequest[field.Field] = this.dreamsolRequest['uhid']
              break;

          }
          this.checkoutForm.controls[objname].setValue(
            this.dreamsolRequest[field.Field],
            Validators.required
          );
          if (this.dreamsolRequest['source_name']?.length > 0 && this.checkoutForm.controls['source']?.value?.length > 0) {
            field.Disable = true;
          }else{
            field.Disable = false;
          }
        } else if (postCRMdata.crmClassName.toLowerCase() === 'tatacapitalcrm'){
          //tatacapitalcrm need to write
          this.AttachmentsList = JSON.parse(this._crmService?.tataCapitalRequest?.Attachment)
          this.newMentionFound = false;
          this.checkoutForm.controls[objname].setValue(
            this.tataCapitalRequest[field.Field],
            Validators.required
          );
        }
        else if (postCRMdata.crmClassName.toLowerCase() === 'duraflexcrm') {
          this.newMentionFound = false;
          if (field.Label === 'RecordTypeId'){
            this.RecordTypeId = field.Field
            this.fields = this.fields.filter(field => field.Label !== 'RecordTypeId');
            return;
          }
          this.checkoutForm.controls[objname].setValue(
            this.duraflexRequest[field?.Field],
            Validators.required
          );
          if (isdisabled) {
            this.checkoutForm.controls[objname].disable();
          }
        }
      }
    }
    this.cdkRef.detectChanges();
    if (postCRMdata.crmClassName.toLowerCase() === 'tataunicrm') {
      if (this.data) {
        if (this.data.tataUniCrmDetailsDoesNotExist && !this.newMentionFound) {
          this.tatauniCrmFlag = true;
          this.mobileView = true;
          this.disableButton = true;
          this.checkoutForm.disable();
        } else {
          this.tatauniCrmFlag = false;
          this.disableButton = false;
          if (!this.newMentionFound) {
            this.checkoutForm.controls.mobilenumber.setValue(this.data?.author?.locoBuzzCRMDetails?.phoneNumber ? this.data?.author?.locoBuzzCRMDetails?.phoneNumber : this.data.mobile);
            this.checkoutForm.controls.emailaddress.setValue(this.data?.author?.locoBuzzCRMDetails?.emailID ? this.data?.author?.locoBuzzCRMDetails?.emailID : this.data.email);
          }
        }
      }
    } else {
      this.disableButton = false;
      this.tatauniCrmFlag = false;
    }

    this.userpostLink = this._footericonService.setOpenPostLink(
      this.postData,
      true
    );
    if (this.newMentionFound) {
      for (const field of this.fields) {
        if (postCRMdata.crmClassName.toLowerCase() === 'octafxcrm') {
          this.changefunction(
            { value: this.octaCrmRequest[field.Field] },
            field.Field
          );
        }
        if (postCRMdata.crmClassName.toLowerCase() === 'fedralcrm') {
          this.changefunction(
            { value: this.fedralrequest[field.Field] },
            field.Field
          );
        }
      }
    }
    if (postCRMdata.crmClassName.toLowerCase() === 'duraflexcrm'){
      this.txtMaxLength=100;
    }
  }

  onSubmit(): any {
    if (this.checkoutForm.valid) {
      let isEmailMasked = this.data?.author?.crmColumns?.existingColumns.find((x) => x.dbColumn == "EmailID");
      if ((this.checkoutForm.value.emailaddress || this.checkoutForm.value.email_id) && isEmailMasked && !isEmailMasked?.isMaskingEnabled) {
        const emailval =
          /^([a-zA-Z0-9_&\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!emailval.test(this.checkoutForm.value.emailaddress || this.checkoutForm.value.email_id)) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Please-enter-valid-email-address'),
            },
          });
          return false;
        }
      }

      if (this.checkoutForm.value.pancard) {
        const pan = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
        if (!pan.test(this.checkoutForm.value.pancard)) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Please-enter-valid-pan-number'),
            },
          });
          return false;
        }
      }

      const postCRMdata = this._filterService.fetchedBrandData.find(
        (brand: BrandList) => +brand.brandID === this.postData.brandInfo.brandID
      );

      let Rgx: any
      if (postCRMdata.crmClassName.toLowerCase() === 'apollocrm') {
        Rgx = new RegExp('^[\s()+-]*([0-9][\s()+-]*){6,20}$');
      } else {
        Rgx = new RegExp('^[0-9-]{3,15}$');
      }
      let isPhoneMasked = this.data?.author?.crmColumns?.existingColumns.find((x) => x.dbColumn == "PhoneNumber");
      if (
        (this.checkoutForm.value.mobilenumber || this.checkoutForm.value.mobile_number) &&
        (!Rgx.test(this.checkoutForm.value.mobilenumber || this.checkoutForm.value.mobile_number)) && isPhoneMasked && !isPhoneMasked?.isMaskingEnabled
      ) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Please-enter-valid-mobile-number'),
          },
        });
        return false;
      }

      if (
        (this.checkoutForm.value.remarks == null ||
          this.checkoutForm.value.remarks == '') && postCRMdata.crmClassName.toLowerCase() != 'dreamsolcrm'
        && postCRMdata.crmClassName.toLowerCase() != 'tatacapitalcrm'
      ) {
        let msg = '';
        if (
          postCRMdata.crmClassName.toLowerCase() == 'magmacrm' ||
          postCRMdata.crmClassName.toLowerCase() == 'titancrm' 
        ) {
          msg = this.translate.instant('Please-enter-comments');
        } else if (postCRMdata.crmClassName.toLowerCase() == 'duraflexcrm'){
          msg = this.translate.instant('Please-enter-description');
        } else {
          msg = this.translate.instant('Please-enter-remarks');
        }
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: msg,
          },
        });
        return false;
      }

      if (this.checkoutForm.value?.mobile_number?.length != 10 && postCRMdata.crmClassName.toLowerCase() == 'dreamsolcrm'){
        let msg;
        msg = this.translate.instant('Please-enter-a-valid-mobile-number');
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: msg,
          },
        });
      }

      let obj = {};

      switch (postCRMdata.crmClassName.toLowerCase()) {
        case 'titancrm': {
          this.titanrequest = this._crmService.titanrequest;
          let Srrequest;

          // Srrequest = {
          //   $type:
          //     'LocobuzzNG.Entities.Classes.Crm.BrandCrm.TitanRequest, LocobuzzNG.Entities',
          //   CaseSource: this.titanrequest.CaseSource,
          //   UserName: this.titanrequest.UserName,
          //   LocobuzzTicketID: this.titanrequest.LocobuzzTicketID,
          //   Channel: this.titanrequest.Channel,
          //   SubChannel: this.titanrequest.SubChannel,
          //   UserProfileurl: this.titanrequest.UserProfileurl,
          //   FollowingCount: this.titanrequest.FollowingCount,
          //   FollowerCount: this.titanrequest.FollowerCount,
          //   ConversationLog: this.checkoutForm.value.conversationlog,
          //   FullName: this.checkoutForm.value.fullname,
          //   MobileNumber: this.checkoutForm.value.mobilenumber,
          //   EmailAddress: this.checkoutForm.value.emailaddress,
          //   CustomerId: this.checkoutForm.value.custId,
          //   StoreLocation: this.checkoutForm.value.storelocation,
          //   Remarks: this.checkoutForm.value.remarks,
          //   QueryType: this.checkoutForm.value.requesttype,
          //   FunctionalArea: this.checkoutForm.value.functionalarea,
          //   DomainArea: this.checkoutForm.value.domainarea,
          //   TagID: this.titanrequest.TagID,
          //   LoggedInUserEmailAddress:
          //     this.titanrequest.LoggedInUserEmailAddress,
          //   CreatedBy: this.titanrequest.CreatedBy,
          //   SrID: this.titanrequest.SrID,
          //   IsUserFeedback: this.titanrequest.IsUserFeedback,
          //   ChannelType: this.postData.channelType.toString(),
          //   LocobuzChannelGroup: this.postData.channelGroup.toString(),
          // };

          let UserProfileurl = '';

          if (this.postData.channelGroup == ChannelGroup.Twitter) {
            UserProfileurl =
              'https://www.twitter.com/' + this.postData.author.screenname;
          } else if (this.postData.channelGroup == ChannelGroup.Facebook) {
            UserProfileurl =
              'http://www.facebook.com/' + this.postData.author.socialId;
          } else if (this.postData.channelGroup == ChannelGroup.Youtube) {
            UserProfileurl =
              'https://www.youtube.com/channel/' +
              this.postData.author.socialId;
          } else if (this.postData.channelGroup == ChannelGroup.Instagram) {
            UserProfileurl =
              'https://www.instagram.com/' + this.postData.author.name;
          }

          Srrequest = {
            $type:
              'LocobuzzNG.Entities.Classes.Crm.BrandCrm.TitanRequest, LocobuzzNG.Entities',
            Brand: this.checkoutForm.value.brand,
            CaseSource: this.titanrequest.CaseSource,
            Channel: this.titanrequest.Channel,
            ChannelType: ChannelType[this.postData.channelType],
            ConversationLog: this.checkoutForm.value.conversationlog,
            CustomerId: this.checkoutForm.value.customerid,
            DomainArea: this.checkoutForm.value.domainarea,
            EmailAddress: this.checkoutForm.value.emailaddress,
            FollowerCount: this.titanrequest.FollowerCount,
            FollowingCount: this.titanrequest.FollowingCount,
            FullName: this.checkoutForm.value.fullname,
            FunctionalArea: this.checkoutForm.value.functionalarea,
            LocobuzzTicketID: this.titanrequest.LocobuzzTicketID,
            LoggedInUserEmailAddress: '',
            MobileNumber: this.checkoutForm.value.mobilenumber,
            QueryType: this.checkoutForm.value.requesttype,
            Remarks: this.checkoutForm.value.remarks,
            StoreLocation: this.checkoutForm.value.storelocation,
            SubChannel: ChannelGroup[this.titanrequest.SubChannel],
            TagID: this.postData.tagID,
            UserName: this.titanrequest.UserName,
            UserProfileurl: UserProfileurl,
            UCIC: this.titanrequest.UCIC,
          };

          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(Srrequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
          break;
        }
        case 'magmacrm': {
          this.magmarequest = this._crmService.magmarequest;
          let Srrequest;
          // Srrequest = {
          //   $type:
          //     'LocobuzzNG.Entities.Classes.Crm.BrandCrm.MagmaRequest, LocobuzzNG.Entities',
          //   Source: this.checkoutForm.value.source,
          //   LocobuzzTicketID: this.magmarequest.LocobuzzTicketID,
          //   MobileNumber: this.checkoutForm.value.mobilenumber,
          //   EmailAddress: this.checkoutForm.value.emailaddress,
          //   FirstName: this.checkoutForm.value.firstname,
          //   LastName: this.checkoutForm.value.lastname,
          //   PanCard: this.checkoutForm.value.pancard,
          //   Product: this.checkoutForm.value.product,
          //   UCIC: this.magmarequest.UCIC,
          //   ConversationLog: this.checkoutForm.value.conversationlog,
          //   Remarks: this.checkoutForm.value.remarks,
          //   Channel: this.magmarequest.Channel,
          //   TagID: this.magmarequest.TagID,
          //   ChannelType: this.postData.channelType.toString(),
          //   LocobuzChannelGroup: this.postData.channelGroup.toString(),
          //   UserProfileurl: this.magmarequest.UserProfileurl,
          //   FollowingCount: this.magmarequest.FollowingCount,
          //   FollowerCount: this.magmarequest.FollowerCount,
          //   SubChannel: this.magmarequest.SubChannel,
          //   UserName: this.magmarequest.UserName,
          //   FullName: this.magmarequest.FullName,
          //   CreatedBy: this.magmarequest.CreatedBy,
          //   SrID: this.magmarequest.SrID,
          //   IsUserFeedback: this.magmarequest.IsUserFeedback,
          //   LoggedInUserEmailAddress:
          //     this.magmarequest.LoggedInUserEmailAddress,
          //   LosLeadID: this.magmarequest.LosLeadID,
          //   Customer: this.magmarequest.Customer,
          //   Disposition: this.magmarequest.Disposition,
          //   SubDisposition: this.magmarequest.SubDisposition,
          //   LeadStatus: this.magmarequest.LeadStatus,
          //   LeadStage: this.magmarequest.LeadStage,
          //   LeadSubStage: this.magmarequest.LeadSubStage,
          //   NewAppointmentDate: this.magmarequest.NewAppointmentDate,
          //   CurrentOwner: this.magmarequest.CurrentOwner,
          //   Owner: this.magmarequest.Owner,
          // };

          Srrequest = {
            $type:
              'LocobuzzNG.Entities.Classes.Crm.BrandCrm.MagmaRequest, LocobuzzNG.Entities',
            Channel: this.magmarequest.Channel,
            ChannelType: ChannelType[this.postData.channelType],
            ConversationLog: this.checkoutForm.value.conversationlog
              ? this.checkoutForm.value.conversationlog
              : 'Test',
            EmailAddress: this.checkoutForm.value.emailaddress,
            FirstName: this.checkoutForm.value.firstname,
            LastName: this.checkoutForm.value.lastname,
            LocobuzzTicketID: this.magmarequest.LocobuzzTicketID,
            MobileNumber: this.checkoutForm.value.mobilenumber,
            PanCard: this.checkoutForm.value.pancard,
            Product: this.checkoutForm.value.product,
            Remarks: this.checkoutForm.value.remarks,
            Source: this.magmarequest.Source,
            TagID: this.postData.tagID,
            UCIC: this.magmarequest.UCIC,
          };

          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(Srrequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
          break;
        }
        case 'fedralcrm': {
          this.fedralrequest = this._crmService.fedralrequest;
          let Srrequest;
          // Srrequest = {
          //   $type:
          //     'LocobuzzNG.Entities.Classes.Crm.BrandCrm.FedralRequest, LocobuzzNG.Entities',
          //   Source: this.fedralrequest.Source,
          //   LocobuzzTicketID: this.fedralrequest.LocobuzzTicketID,
          //   MobileNumber: this.checkoutForm.value.mobilenumber,
          //   EmailAddress: this.checkoutForm.value.emailaddress,
          //   FirstName: this.checkoutForm.value.firstname,
          //   LastName: this.checkoutForm.value.lastname,
          //   Category: this.checkoutForm.value.category,
          //   RequestType: this.checkoutForm.value.requesttype,
          //   UCIC: this.fedralrequest.UCIC,
          //   ConversationLog: this.checkoutForm.value.conversationlog,
          //   Remarks: this.checkoutForm.value.remarks,
          //   Channel: this.fedralrequest.Channel,
          //   TagID: this.fedralrequest.TagID,
          //   ChannelType: this.postData.channelType.toString(),
          //   LocobuzChannelGroup: this.postData.channelGroup.toString(),
          //   Severity: '',
          //   City: this.checkoutForm.value.city,
          //   State: this.checkoutForm.value.state,
          //   Address: this.checkoutForm.value.address,
          //   PostalCode: this.checkoutForm.value.postalcode,
          //   Country: this.checkoutForm.value.country,
          //   UserProfileurl: this.fedralrequest.UserProfileurl,
          //   FollowingCount: this.fedralrequest.FollowingCount,
          //   FollowerCount: this.fedralrequest.FollowerCount,
          //   SubChannel: this.fedralrequest.SubChannel,
          //   UserName: this.fedralrequest.UserName,
          //   FullName: this.fedralrequest.FullName,
          //   CreatedBy: this.fedralrequest.CreatedBy,
          //   SrID: this.fedralrequest.SrID,
          //   IsUserFeedback: this.fedralrequest.IsUserFeedback,
          //   LoggedInUserEmailAddress:
          //     this.fedralrequest.LoggedInUserEmailAddress,
          //   LosLeadID: '',
          // };

          const locationDetails = this.fields.find(
            (obj) => obj.Field == 'Location'
          );
          const subsubCatDetails = this.fields.find(
            (obj) => obj.Field == 'SubSubCategory'
          );
          let locationName = '';
          let subsubcategoryName = '';
          if (locationDetails && this.checkoutForm.value.location) {
            locationName = locationDetails.Data.find(
              (obj) => obj.Key == this.checkoutForm.value.location
            ).Value;
          }

          if (subsubCatDetails && this.checkoutForm.value.subsubcategory) {
            subsubcategoryName = subsubCatDetails.Data.find(
              (obj) => obj.Key == this.checkoutForm.value.subsubcategory
            ).Value;
          }

          let gender = '';
          gender =
            this.checkoutForm.value.gender == 'M'
              ? 'Male'
              : this.checkoutForm.value.gender == 'F'
              ? 'Female'
              : 'UnSpecified';

          Srrequest = {
            $type:
              'LocobuzzNG.Entities.Classes.Crm.BrandCrm.FedralRequest, LocobuzzNG.Entities',
            Category: this.checkoutForm.value.category,
            CategoryName: this.checkoutForm.value.category,
            Channel: this.fedralrequest.Channel,
            ChannelType: ChannelType[this.postData.channelType],
            ConversationLog: this.checkoutForm.value.conversationlog,
            CountryCode: this.checkoutForm.value.countrycode,
            CreatedDate: null,
            EmailAddress: this.checkoutForm.value.emailaddress,
            FirstName: this.checkoutForm.value.firstname,
            FollowerCount: this.fedralrequest.FollowerCount,
            FollowingCount: this.fedralrequest.FollowingCount,
            Gender: gender,
            Influencer: '',
            LastName: this.checkoutForm.value.lastname,
            LeadType: this.checkoutForm.value.leadtype
              ? this.checkoutForm.value.leadtype
              : '',
            LocobuzzTicketID: this.fedralrequest.LocobuzzTicketID,
            MobileNumber: this.checkoutForm.value.mobilenumber,
            ParentPost: '',
            PostLink: this.postData.url,
            Priority: Priority[this.postData.ticketInfo.ticketPriority],
            ProductNumber: this.checkoutForm.value.subsubcategory,
            Rating: '',
            Remarks: this.checkoutForm.value.remarks,
            RequestType: this.requestType,
            Sentiment: Sentiment[this.postData.sentiment],
            SolID: this.checkoutForm.value.location,
            SourceHandle: '',
            SrID: this.fedralrequest.SrID,
            StoreLocation: locationName,
            SubCategoryName: this.checkoutForm.value.subcategory,
            SubSubCategoryName: subsubcategoryName,
            TagID: this.postData.tagID,
            UCIC: this.fedralrequest.UCIC,
            UserName: this.fedralrequest.UserName,
            UserProfileurl: this.UserProfileurl,
          };

          // {
          //   $type: "LocobuzzNG.Entities.Classes.Crm.BrandCrm.FedralRequest, LocobuzzNG.Entities"
          //   Category: this.checkoutForm.value.category
          //   CategoryName: "Retail Liabilities - NR"
          //   Channel: this.fedralrequest.Channel
          //   ChannelType: this.postData.channelType.toString()
          //   ConversationLog: "prashantpange4:\\nApr 11 2022, 4:12:36 PM ,1 month ago :\\n@Pushpra13254382\\n crm test 1\\n\\n"
          //   CountryCode: "91"
          //   CreatedDate: 1643987885.227
          //   EmailAddress: "bituss.30@gmail.com"
          //   FirstName: this.checkoutForm.value.firstname
          //   FollowerCount: this.fedralrequest.FollowerCount
          //   FollowingCount: this.fedralrequest.FollowingCount
          //   Gender: "M"
          //   Influencer: ""
          //   LastName: this.checkoutForm.value.lastname
          //   LeadType: "HOT"
          //   LocobuzzTicketID: "321677"
          //   MobileNumber: "1111111111"
          //   ParentPost: ""
          //   PostLink: "https://www.twitter.com/prashantpange4/status/"
          //   Priority: "Low"
          //   SourceHandle: "35148"
          //   Rating: ""
          //   Remarks: " test fedral crm"
          //   RequestType: "2"
          //   Sentiment: "Neutral"
          //   SolID: "CC_BGR"
          //   SourceHandle: ""
          //   SrID: this.fedralrequest.SrID
          //   StoreLocation: "Contact Center - Bangalore"
          //   SubCategoryName: "NRE SB Normal"
          //   SubSubCategoryName: "SB NRE POWER"
          //   TagID: this.fedralrequest.TagID
          //   UCIC: this.fedralrequest.UCIC
          //   UserName: this.fedralrequest.UserName
          //   UserProfileurl: this.fedralrequest.UserProfileurl
          // }

          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(Srrequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
          break;
        }
        case 'bandhancrm': {
          this.bandhanrequest = this._crmService.bandhanrequest;
          let Srrequest;
          const querytype = this.fields.find((x) => x.Field === 'QueryType');

          let querytype1;
          if (querytype) {
            querytype1 = querytype.Data.find(
              (x) => x.Key === this.checkoutForm.value.querytype
            );
          }

          // Srrequest = {
          //   $type:
          //     'LocobuzzNG.Entities.Classes.Crm.BrandCrm.BandhanRequest, LocobuzzNG.Entities',
          //   UserProfileurl: this.bandhanrequest.UserProfileurl,
          //   FollowingCount: this.bandhanrequest.FollowingCount,
          //   FollowerCount: this.bandhanrequest.FollowerCount,
          //   LocobuzzTicketID: this.bandhanrequest.LocobuzzTicketID,
          //   MobileNumber: this.checkoutForm.value.mobilenumber,
          //   EmailAddress: this.checkoutForm.value.emailaddress,
          //   FirstName: this.checkoutForm.value.firstname,
          //   LastName: this.checkoutForm.value.lastname,
          //   RequestType: BTCCrmRequestType.Query,
          //   UCIC: this.bandhanrequest.UCIC,
          //   ConversationLog: this.checkoutForm.value.conversationlog,
          //   Remarks: this.checkoutForm.value.remarks,
          //   Channel: this.bandhanrequest.Channel,
          //   TagID: this.bandhanrequest.TagID,
          //   ChannelType: this.postData.channelType.toString(),
          //   LocobuzChannelGroup: this.postData.channelGroup.toString(),
          //   ProductGroup: this.bandhanrequest.ProductGroup,
          //   QueryType: this.checkoutForm.value.querytype,
          //   QueryName: querytype1 ? querytype1.Value : '',
          //   LatestTagId: this.bandhanrequest.LatestTagId,
          //   LatestTagIdEpochTime: this.bandhanrequest.LatestTagIdEpochTime,
          //   SubType: this.checkoutForm.value.subtype,
          //   SubCategoryType: this.checkoutForm.value.subcategorytype,
          //   SubChannel: this.bandhanrequest.SubChannel,
          //   UserName: this.bandhanrequest.UserName,
          //   FullName: this.bandhanrequest.FullName,
          //   CreatedBy: this.bandhanrequest.CreatedBy,
          //   SrID: this.bandhanrequest.SrID,
          //   IsUserFeedback: this.bandhanrequest.IsUserFeedback,
          //   LoggedInUserEmailAddress:
          //     this.bandhanrequest.LoggedInUserEmailAddress,
          //   Source: this.bandhanrequest.Source,
          //   LosLeadID: '',
          //   AuthorDetails: this.bandhanrequest.AuthorDetails,
          // };

          Srrequest = {
            $type:
              'LocobuzzNG.Entities.Classes.Crm.BrandCrm.BandhanRequest, LocobuzzNG.Entities',
            Channel: this.bandhanrequest.Channel,
            ChannelType: ChannelType[this.postData.channelType],
            ConversationLog: this.checkoutForm.value.conversationlog,
            EmailAddress: this.checkoutForm.value.emailaddress
              ? this.checkoutForm.value.emailaddress
              : '',
            FirstName: this.checkoutForm.value.firstname,
            FollowerCount: this.bandhanrequest.FollowerCount
              ? this.bandhanrequest.FollowerCount
              : 0,
            FollowingCount: this.bandhanrequest.FollowingCount
              ? this.bandhanrequest.FollowingCount
              : 0,
            LastName: this.checkoutForm.value.lastname,
            LatestTagId: this.postData.tagID,
            LatestTagIdEpochTime: this.bandhanrequest.LatestTagIdEpochTime,
            LocobuzzTicketID: this.bandhanrequest.LocobuzzTicketID,
            MobileNumber: this.checkoutForm.value.mobilenumber,
            // ProductGroup: this.checkoutForm.value.querytype,
            QueryName: querytype1 ? querytype1.Value : '',
            QueryType: this.checkoutForm.value.querytype,
            Remarks: this.checkoutForm.value.remarks,
            RequestType: this.requestType,
            SrID: this.bandhanrequest.SrID,
            SubCategoryType: this.checkoutForm.value.subcategorytype,
            SubType: this.checkoutForm.value.subtype,
            TagID: this.postData.tagID,
            UCIC: this.bandhanrequest.UCIC,
            UserProfileurl: this.UserProfileurl,
          };

          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(Srrequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
          break;
        }
        case 'apollocrm': {
          this.apollorequest = this._crmService.apollorequest;
          let Srrequest;
          const querytype = this.fields.find((x) => x.Field === 'QueryType');

          let querytype1;
          if (querytype) {
            querytype1 = querytype.Data.find(
              (x) => x.Key === this.checkoutForm.value.querytype
            );
          }

          // Srrequest = {
          //   $type:
          //     'LocobuzzNG.Entities.Classes.Crm.BrandCrm.BandhanRequest, LocobuzzNG.Entities',
          //   UserProfileurl: this.bandhanrequest.UserProfileurl,
          //   FollowingCount: this.bandhanrequest.FollowingCount,
          //   FollowerCount: this.bandhanrequest.FollowerCount,
          //   LocobuzzTicketID: this.bandhanrequest.LocobuzzTicketID,
          //   MobileNumber: this.checkoutForm.value.mobilenumber,
          //   EmailAddress: this.checkoutForm.value.emailaddress,
          //   FirstName: this.checkoutForm.value.firstname,
          //   LastName: this.checkoutForm.value.lastname,
          //   RequestType: ApolloRequestType.Query,
          //   UCIC: this.bandhanrequest.UCIC,
          //   ConversationLog: this.checkoutForm.value.conversationlog,
          //   Remarks: this.checkoutForm.value.remarks,
          //   Channel: this.bandhanrequest.Channel,
          //   TagID: this.bandhanrequest.TagID,
          //   ChannelType: this.postData.channelType.toString(),
          //   LocobuzChannelGroup: this.postData.channelGroup.toString(),
          //   //  ProductGroup: this.bandhanrequest.ProductGroup,
          //   //  QueryType: this.checkoutForm.value.querytype,
          //   //  QueryName: querytype1 ? querytype1.Value : '',
          //   LatestTagId: this.bandhanrequest.LatestTagId,
          //   LatestTagIdEpochTime: this.bandhanrequest.LatestTagIdEpochTime,
          //   //  SubType: this.checkoutForm.value.subtype,
          //   //  SubCategoryType: this.checkoutForm.value.subcategorytype,
          //   SubChannel: this.bandhanrequest.SubChannel,
          //   UserName: this.bandhanrequest.UserName,
          //   FullName: this.bandhanrequest.FullName,
          //   CreatedBy: this.bandhanrequest.CreatedBy,
          //   SrID: this.bandhanrequest.SrID,
          //   IsUserFeedback: this.bandhanrequest.IsUserFeedback,
          //   LoggedInUserEmailAddress:
          //     this.bandhanrequest.LoggedInUserEmailAddress,
          //   Source: this.bandhanrequest.Source,
          //   LosLeadID: '',
          //   CityId: '',
          //   City: '',
          //   HospitalId: '',
          //   Hospital: '',
          //   DoctorId: '',
          //   SpecialityId: '',
          //   LeadSource: '',
          //   LeadName: '',
          //   LeadRequestType: '',
          //   Doctor: '',
          //   Speciality: '',

          //   AuthorDetails: this.bandhanrequest.AuthorDetails,
          // };

          let city = '',
            doctor = '',
            hospital = '',
            leadName = '',
            speciality = '',
            subcategory = '',
            attribute = '',
            caseType = '',
            category = '';

          if (this.checkoutForm.value.attribute) {
            const formField = this.fields.find(
              (obj) => obj.Label == 'Attribute'
            );
            attribute = formField
              ? formField.Data.find(
                  (obj) => obj.Key == this.checkoutForm.value.attribute
                ).Value
              : '';
          }
          if (this.checkoutForm.value.casetype) {
            const formField = this.fields.find(
              (obj) => obj.Label == 'Case Type'
            );
            caseType = formField
              ? formField.Data.find(
                  (obj) => obj.Key == this.checkoutForm.value.casetype
                ).Value
              : '';
          }
          if (this.checkoutForm.value.city) {
            const formField = this.fields.find((obj) => obj.Label == 'City');
            city = formField
              ? formField.Data.find(
                  (obj) => obj.Key == this.checkoutForm.value.city
                ).Value
              : '';
          }
          if (this.checkoutForm.value.doctor) {
            const formField = this.fields.find((obj) => obj.Label == 'Doctor');
            doctor = formField
              ? formField.Data.find(
                  (obj) => obj.Key == this.checkoutForm.value.doctor
                ).Value
              : '';
          }
          if (this.checkoutForm.value.hospital) {
            const formField = this.fields.find(
              (obj) => obj.Label == 'Hospital'
            );
            hospital = formField
              ? formField.Data.find(
                  (obj) => obj.Key == this.checkoutForm.value.hospital
                ).Value
              : '';
          }
          if (this.checkoutForm.value.leadname) {
            const formField = this.fields.find(
              (obj) => obj.Label == 'Lead Name'
            );
            leadName = formField
              ? formField.Data.find(
                  (obj) => obj.Key == this.checkoutForm.value.leadname
                ).Value
              : '';
          }
          if (this.checkoutForm.value.speciality) {
            const formField = this.fields.find(
              (obj) => obj.Label == 'Speciality'
            );
            speciality = formField
              ? formField.Data.find(
                  (obj) => obj.Key == this.checkoutForm.value.speciality
                ).Value
              : '';
          }
          if (this.checkoutForm.value.subcategory) {
            const formField = this.fields.find(
              (obj) => obj.Label == 'Sub-Category'
            );
            category = formField
              ? formField.Data.find(
                  (obj) => obj.Key == this.checkoutForm.value.subcategory
                ).Value
              : '';
          }

          if (this.checkoutForm.value.category) {
            const formField = this.fields.find(
              (obj) => obj.Label == 'Category'
            );
            category = formField
              ? formField.Data.find(
                  (obj) => obj.Key == this.checkoutForm.value.category
                ).Value
              : '';
          }

          Srrequest = {
            $type:
              'LocobuzzNG.Entities.Classes.Crm.BrandCrm.ApolloRequest, LocobuzzNG.Entities',
            Attribute: attribute,
            AttributeId: this.checkoutForm.value.attribute,
            CaseType: caseType,
            CaseTypeID: this.checkoutForm.value.casetype,
            Category: category,
            CategoryId: this.checkoutForm.value.category,
            Channel: ChannelGroup[this.postData.channelGroup],
            ChannelType: ChannelType[this.postData.channelType],
            City: city,
            CityId: this.checkoutForm.value.city,
            ConversationLog: this.checkoutForm.value.conversationlog,
            Doctor: doctor,
            DoctorId: this.checkoutForm.value.doctor,
            EmailAddress: this.checkoutForm.value.emailaddress,
            FirstName: this.checkoutForm.value.firstname,
            FollowerCount: this.apollorequest.FollowerCount,
            FollowingCount: this.apollorequest.FollowingCount,
            Hospital: hospital,
            HospitalId: this.checkoutForm.value.hospital,
            LastName: this.checkoutForm.value.lastname,
            LatestTagId: this.apollorequest.LatestTagId,
            LatestTagIdEpochTime: this.apollorequest.LatestTagIdEpochTime,
            LeadName: leadName,
            LeadRequestType: this.checkoutForm.value.leadname,
            LeadSource: this.checkoutForm.value['lead source'],
            LocobuzzTicketID: this.apollorequest.LocobuzzTicketID,
            MobileNumber: this.checkoutForm.value.mobilenumber,
            PostUrl: this.userpostLink,
            Priority: Priority[this.postData.ticketInfo.ticketPriority],
            Remarks: this.checkoutForm.value.remarks,
            RequestType: this.requestType,
            Speciality: speciality,
            SpecialityId: this.checkoutForm.value.speciality,
            SrID: this.apollorequest.SrID,
            SubCategory: subcategory,
            SubCategoryId: this.checkoutForm.value.subcategory,
            TagID: this.postData.tagID,
            UCIC: this.apollorequest.UCIC,
            UserProfileurl: this.UserProfileurl,
          };

          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(Srrequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
          break;
        }
        case 'recrm': {
          let recrmRequest = {
            $type:
              'LocobuzzNG.Entities.Classes.Crm.BrandCrm.RECrmRequest, LocobuzzNG.Entities',
            Channel: this.recrmrequest.Channel,
            ChannelType: ChannelType[this.postData.channelType],
            City: this.checkoutForm.value.city,
            ComplaintSubCategory: '',
            ComplaintSubSubType: '',
            ComplaintType: this.checkoutForm.value.complainttype,
            ConversationLog: this.checkoutForm.value.conversationlog,
            CreatedDate: this.recrmrequest.CreatedDate,
            Dealer: '',
            EmailAddress: this.checkoutForm.value.emailaddress,
            FirstName: this.checkoutForm.value.firstname,
            FollowerCount: this.recrmrequest.FollowerCount
              ? this.recrmrequest.FollowerCount
              : 0,
            FollowingCount: this.recrmrequest.FollowingCount
              ? this.recrmrequest.FollowingCount
              : 0,
            Language: this.postData.languageName,
            LastName: this.checkoutForm.value.lastname,
            LocobuzzTicketID: this.recrmrequest.LocobuzzTicketID,
            MobileNumber: this.checkoutForm.value.mobilenumber,
            PostUrl: this.userpostLink,
            Priority: Priority[this.postData.ticketInfo.ticketPriority],
            QueryReason: this.checkoutForm.value.queryreason,
            QuerySubCategory: this.checkoutForm.value.querysubcategory,
            QueryType: this.checkoutForm.value.querytype,
            Rating: this.postData.rating,
            Remarks: this.checkoutForm.value.remarks,
            RequestType: this.requestType,
            RequestTypeText: this.requestTypeTitle,
            ScreenName: this.postData.author.screenname,
            Sentiment: Sentiment[this.postData.sentiment],
            SrID: this.recrmrequest.SrID,
            TagID: this.postData.tagID,
            UCIC: this.recrmrequest.UCIC,
            UserProfileurl: this.UserProfileurl,
          };
          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(recrmRequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
          break;
        }
        case 'octafxcrm': {
          let octaFxcrmRequest = {
            $type:
              'LocobuzzNG.Entities.Classes.Crm.BrandCrm.OctaCrmRequest, LocobuzzNG.Entities',
            Channel: this.octaCrmRequest.Channel,
            ChannelType: ChannelType[this.postData.channelType],
            ConversationLog: this.checkoutForm.value.conversationlog,
            CreatedDate: this.octaCrmRequest.CreatedDate,
            EmailAddress: this.checkoutForm.value.emailaddress,
            FirstName: this.checkoutForm.value.firstname,
            FollowerCount: this.octaCrmRequest.FollowerCount
              ? this.octaCrmRequest.FollowerCount
              : 0,
            FollowingCount: this.octaCrmRequest.FollowingCount
              ? this.octaCrmRequest.FollowingCount
              : 0,
            Language: this.postData.languageName,
            LastName: this.checkoutForm.value.lastname,
            LocobuzzTicketID: this.octaCrmRequest.LocobuzzTicketID,
            MobileNumber: this.checkoutForm.value.mobilenumber,
            PostUrl: this.userpostLink,
            Priority: Priority[this.postData.ticketInfo.ticketPriority],
            Rating: this.postData.rating,
            Remarks: this.checkoutForm.value.remarks,
            RequestType: this.requestType,
            RequestTypeText: this.requestTypeTitle,
            ScreenName: this.postData.author.screenname,
            Sentiment: Sentiment[this.postData.sentiment],
            SrID: this.octaCrmRequest.SrID,
            TagID: this.postData.tagID,
            UCIC: this.octaCrmRequest.UCIC,
            UserProfileurl: this.UserProfileurl,
            cf_account_number: '',
            cf_info_new_demat_account: '',
            cf_issue_subtype: this.checkoutForm.value.issuesubtype,
            cf_issue_type: this.checkoutForm.value.issuetype,
            cf_pan_no_of_applicant: '',
            ticket_type: this.checkoutForm.value.tickettype,
          };

          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(octaFxcrmRequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
          break;
        }
        case 'extramarkscrm': {
          let categoryName = '';

          if (this.checkoutForm.value.category) {
            const categoryDetails = this.fields.find(
              (obj) => obj.Label == 'Category'
            );
            categoryName = categoryDetails.Data.find(
              (obj) => obj.Key == this.checkoutForm.value.category
            ).Value;
          }

          let extraMarkRequest = {
            $type:
              'LocobuzzNG.Entities.Classes.Crm.BrandCrm.ExtraMarksRequest, LocobuzzNG.Entities',
            Category: categoryName,
            CategoryId: this.checkoutForm.value.category,
            Channel: this.extraMarkCrmRequest.Channel,
            ChannelType: ChannelType[this.postData.channelType],
            ConversationLog: this.checkoutForm.value.conversationlog,
            EmailAddress: this.checkoutForm.value.emailaddress,
            FirstName: this.checkoutForm.value.firstname,
            FollowerCount: this.extraMarkCrmRequest.FollowerCount,
            FollowingCount: this.extraMarkCrmRequest.FollowingCount,
            Language: '',
            LastName: this.checkoutForm.value.lastname,
            LatestTagId: this.extraMarkCrmRequest.LatestTagId,
            LatestTagIdEpochTime: this.extraMarkCrmRequest.LatestTagIdEpochTime,
            LocobuzzTicketID: this.extraMarkCrmRequest.LocobuzzTicketID,
            MobileNumber: this.checkoutForm.value.mobilenumber,
            PostUrl: this.userpostLink,
            Priority: Priority[this.postData.ticketInfo.ticketPriority],
            Rating: this.postData.rating,
            Remarks: this.checkoutForm.value.remarks,
            ScreenName: this.postData.author.screenname,
            Sentiment: Sentiment[this.postData.sentiment],
            SrID: this.extraMarkCrmRequest.SrID,
            TagID: this.postData.tagID,
            UCIC: this.extraMarkCrmRequest.UCIC,
            UserProfileurl: this.UserProfileurl,
            RequestType: this.requestType,
            RequestTypeText: this.requestTypeTitle,
          };
          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(extraMarkRequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
          break;
        }
        case 'tataunicrm': {
          let brand = '',
            category = '',
            issueCategory = '',
            issueclassification = '',
            source = '',
            type = '';

          if (this.checkoutForm.value.brand) {
            const BrandDetailsList = this.fields.find(
              (obj) => obj.Label == 'Brand'
            ).Data;
            brand = BrandDetailsList.find(
              (obj) => obj.Key == this.checkoutForm.value.brand
            ).Value;
          }
          if (this.checkoutForm.value.category) {
            const categoryDetailsList = this.fields.find(
              (obj) => obj.Label == 'Category'
            ).Data;
            category = categoryDetailsList.find(
              (obj) => obj.Key == this.checkoutForm.value.category
            ).Value;
          }
          if (this.checkoutForm.value.issuecategory) {
            const issueCategoryDetailsList = this.fields.find(
              (obj) => obj.Label == 'Issue Category'
            ).Data;
            issueCategory = issueCategoryDetailsList.find(
              (obj) => obj.Key == this.checkoutForm.value.issuecategory
            ).Value;
          }
          if (this.checkoutForm.value.issueclassification) {
            const issueclassificationDetailsList = this.fields.find(
              (obj) => obj.Label == 'Issue Classification'
            ).Data;
            issueclassification = issueclassificationDetailsList.find(
              (obj) => obj.Key == this.checkoutForm.value.issueclassification
            ).Value;
          }
          if (this.checkoutForm.value.type) {
            const typeDetailsList = this.fields.find(
              (obj) => obj.Label == 'Type'
            ).Data;
            type = typeDetailsList.find(
              (obj) => obj.Key == this.checkoutForm.value.type
            ).Value;
          }
          if (this.checkoutForm.controls.source.value) {
            const sourceDetailsList = this.fields.find(
              (obj) => obj.Label == 'Source'
            ).Data;
            source = sourceDetailsList.find(
              (obj) => obj.Key == this.checkoutForm.controls.source.value
            ).Value;
          }

          let UserProfileurl = '';

          if (this.postData.channelGroup == ChannelGroup.Twitter) {
            UserProfileurl =
              'https://www.twitter.com/' + this.postData.author.screenname;
          } else if (this.postData.channelGroup == ChannelGroup.Facebook) {
            UserProfileurl =
              'http://www.facebook.com/' + this.postData.author.socialId;
          } else if (this.postData.channelGroup == ChannelGroup.Youtube) {
            UserProfileurl =
              'https://www.youtube.com/channel/' +
              this.postData.author.socialId;
          } else if (this.postData.channelGroup == ChannelGroup.Instagram) {
            UserProfileurl =
              'https://www.instagram.com/' + this.postData.author.name;
          }

          let recrmRequest = {
            $type:
              'LocobuzzNG.Entities.Classes.Crm.BrandCrm.TataUniCrmRequest, LocobuzzNG.Entities',
            Attachments: this.tataUnicrmrequest.attachments
              ? this.tataUnicrmrequest.attachments
              : '',
            Brand: brand,
            Brandid: this.checkoutForm.value.brand,
            Category: category,
            CategoryId: this.checkoutForm.value.category,
            Channel: this.tataUnicrmrequest.Channel,
            ChannelType: ChannelType[this.postData.channelType],
            ConversationLog: this.checkoutForm.value.conversationlog
              ? this.checkoutForm.value.conversationlog
              : 'null',
            CreatedDate: moment
              .utc(this.postData.ticketInfo.caseCreatedDate)
              .local()
              .unix(),
            CustomerHash: this.data.CustomerHash,
            EmailAddress: this.checkoutForm.value.emailaddress,
            FollowerCount: this.tataUnicrmrequest.FollowerCount,
            FollowingCount: this.tataUnicrmrequest.FollowingCount,
            IssueCategory: issueCategory,
            IssueCategoryId: this.checkoutForm.value.issuecategory,
            IssueClassification: issueclassification,
            IssueClassificationId: this.checkoutForm.value.issueclassification,
            LocobuzzTicketID: this.tataUnicrmrequest.LocobuzzTicketID,
            MobileNumber: this.checkoutForm.value.mobilenumber,
            Name: this.checkoutForm.value.fullname,
            PostUrl: this.userpostLink,
            Priority: Priority[this.postData.ticketInfo.ticketPriority],
            Remarks: this.checkoutForm.value.remarks,
            SRID: this.tataUnicrmrequest.SrID,
            Sentiment: Sentiment[this.postData.sentiment],
            Source: source,
            Sourceid: this.checkoutForm.controls.source.value,
            SrID: this.tataUnicrmrequest.SrID,
            TagID: String(this.postData.tagID),
            Type: type,
            Typeid: this.checkoutForm.value.type,
            UCIC: this.tataUnicrmrequest.UCIC,
            UserName: this.tataUnicrmrequest.UserName,
            UserProfileurl: UserProfileurl,
            VIP: this.tataUnicrmrequest.VIP,
            posttimeline: this.tataUnicrmrequest.posttimeline
              ? this.tataUnicrmrequest.posttimeline
              : [
                  {
                    postid: this.postData.socialID,
                    postlink: this.userpostLink,
                    posttime: moment
                      .utc(this.postData.ticketInfo.caseCreatedDate)
                      .local()
                      .unix(),
                    authorid: this.postData.author.socialId,
                    authorname: this.postData.author.name,
                  },
                ],
          };
          // 0: { postid: '1536303213343043584', postlink: '', posttime: 1648731967, authorid: '1252493826091970560', authorname: 'Anushri' }

          let maskedData = [
            {
              MAPID: this.data?.author?.locoBuzzCRMDetails?.id,
              OrderID: this.data?.author?.crmColumns?.existingColumns.filter((x) => x.dbColumn == "EmailID")[0].orderID,
              ColumnLable: this.data?.author?.crmColumns?.existingColumns.filter((x) => x.dbColumn == "EmailID")[0].columnLable,
              IsMaskingEnabled: this.data?.author?.crmColumns?.existingColumns.filter((x) => x.dbColumn == "EmailID")[0].isMaskingEnabled,
            },
            {
              MAPID: this.data?.author?.locoBuzzCRMDetails?.id,
              OrderID: this.data?.author?.crmColumns?.existingColumns.filter((x) => x.dbColumn == "PhoneNumber")[0].orderID,
              ColumnLable: this.data?.author?.crmColumns?.existingColumns.filter((x) => x.dbColumn == "PhoneNumber")[0].columnLable,
              IsMaskingEnabled: this.data?.author?.crmColumns?.existingColumns.filter((x) => x.dbColumn == "PhoneNumber")[0].isMaskingEnabled,
            }
          ];

          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(recrmRequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
            MaskData: maskedData,
          };

          break;
        }
        case 'dreamsolcrm':{
          let dreamsolRequest: DreamsolRequest;
          dreamsolRequest = {
            Channel: this.dreamsolRequest.Channel
              ? this.dreamsolRequest.Channel
              : ChannelGroup[this.postData.channelGroup],
            ChannelType: this.dreamsolRequest.ChannelType,
            ConversationLog: this.dreamsolRequest.ConversationLog,
            CreatedBy: this.dreamsolRequest.CreatedBy,
            EmailAddress: this.dreamsolRequest.EmailAddress,
            FollowerCount: this.dreamsolRequest.FollowerCount,
            FollowingCount: this.dreamsolRequest.FollowingCount,
            FullName: this.dreamsolRequest.FullName,
            IsUserFeedback: this.dreamsolRequest.IsUserFeedback,
            LocobuzChannelGroup: this.postData.channelGroup.toString(),
            LocobuzzTicketID: this.dreamsolRequest.LocobuzzTicketID,
            LoggedInUserEmailAddress: this.dreamsolRequest.LoggedInUserEmailAddress,
            MobileNumber: this.dreamsolRequest.MobileNumber,
            Remarks: this.dreamsolRequest.Remarks,
            SrID: this.dreamsolRequest.SrID,
            SubChannel: this.dreamsolRequest.SubChannel,
            TagID: String(this.postData.tagID),
            UserName: this.dreamsolRequest.UserName,
            UserProfileurl: this.dreamsolRequest.UserProfileurl,
            $type:
            'LocobuzzNG.Entities.Classes.Crm.BrandCrm.ExtraMarksRequest, LocobuzzNG.Entities',
            RequestType: this.dreamsolRequest.RequestType,
            uhid: this.checkoutForm.value.uhid,
            first_name: this.checkoutForm.value.first_name,
            last_name: this.checkoutForm.value.last_name,
            mobile_number: this.checkoutForm.value.mobile_number? (this.selectedCountry.code +''+this.checkoutForm.value.mobile_number):'',
            email_id: this.checkoutForm.value.email_id,
            unit_name: this.checkoutForm.value.unit_name,
            comments: this.checkoutForm.value.comments,
            ucic: this.postData.author.socialId,
            type: this.checkoutForm.value.type,
            submitted_on: moment().utc().toString(),
            source:this.checkoutForm.value.source,
            source_name: this.source_name,
            type_name: this.type_name,
            unit_name_displayname: this.unit_name_displayname
          };
          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(dreamsolRequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
          break;
        }
        case 'tatacapitalcrm':{
          this.checkoutForm.controls['attachments'].setValue(this.AttachmentsList)
          //tatacapitalcrm need to write
          let tataCapitalRequest: TataCapitalRequest;
          tataCapitalRequest = {
            Channel: this.tataCapitalRequest.Channel
              ? this.tataCapitalRequest.Channel
              : ChannelGroup[this.postData.channelGroup],
            ChannelType: this.tataCapitalRequest.ChannelType,
            CreatedBy: this.tataCapitalRequest.CreatedBy,
            FollowerCount: this.tataCapitalRequest.FollowerCount,
            FollowingCount: this.tataCapitalRequest.FollowingCount,
            IsUserFeedback: this.tataCapitalRequest.IsUserFeedback,
            LocobuzChannelGroup: this.postData.channelGroup.toString(),
            LocobuzzTicketID: this.tataCapitalRequest.LocobuzzTicketID,
            LoggedInUserEmailAddress: this.tataCapitalRequest.LoggedInUserEmailAddress,
            Remarks: this.tataCapitalRequest.Remarks,
            SrID: this.tataCapitalRequest.SrID,
            SubChannel: this.tataCapitalRequest.SubChannel,
            TagID: String(this.postData.tagID),
            UserName: this.tataCapitalRequest.UserName,
            UserProfileurl: this.tataCapitalRequest.UserProfileurl,
            $type:
            'LocobuzzNG.Entities.Classes.Crm.BrandCrm.ExtraMarksRequest, LocobuzzNG.Entities',
            UCIC: this.postData.author.socialId,
            RequestType: this.tataCapitalRequest.RequestType,
            FullName: this.checkoutForm.value.fullname,
            EmailAddress: this.checkoutForm.value.emailaddress,
            MobileNumber: this.checkoutForm.value.mobilenumber,
            LoanAccountType: this.checkoutForm.value.loanaccounttype,
            Attachments: this.checkoutForm.value.attachments,
            ProductName: this.checkoutForm.value.productname,
            PostType: this.checkoutForm.value.posttype,
            ConversationLog: '',
            Description: this.checkoutForm.value.conversationlog,
            Sentiments: this.checkoutForm.value.sentiments,
            ComplaintCategory: this.checkoutForm.value.complaintcategory,
            ORMTray: this.checkoutForm.value.ormtray,
            Status: "New",
            SubmittedOn: moment().utc().format('YYYY-MM-DD HH:mm A')
          };
          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(tataCapitalRequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
          break;
        }
        case 'duraflexcrm': {
          let duraflexRequest = {
            Channel: this.duraflexRequest.Channel
              ? this.duraflexRequest.Channel
              : ChannelGroup[this.postData.channelGroup],
            ChannelType: this.duraflexRequest.ChannelType,
            ConversationLog: this.duraflexRequest.ConversationLog,
            CreatedBy: this.duraflexRequest.CreatedBy,
            EmailAddress: this.checkoutForm.value.emailaddress,
            FollowerCount: this.duraflexRequest.FollowerCount,
            FollowingCount: this.duraflexRequest.FollowingCount,
            FullName: this.duraflexRequest.FullName,
            IsUserFeedback: this.duraflexRequest.IsUserFeedback,
            LocobuzChannelGroup: this.postData.channelGroup.toString(),
            LocobuzzTicketID: this.duraflexRequest.LocobuzzTicketID,
            LoggedInUserEmailAddress: this.duraflexRequest.LoggedInUserEmailAddress,
            MobileNumber: this.checkoutForm.value.mobilenumber,
            Remarks: this.checkoutForm.value.remarks,
            SrID: this.duraflexRequest.SrID,
            SubChannel: this.duraflexRequest.SubChannel,
            TagID: String(this.postData.tagID),
            UserName: this.duraflexRequest.UserName,
            UserProfileurl: this.duraflexRequest.UserProfileurl,
            $type:
              'LocobuzzNG.Entities.Classes.Crm.BrandCrm.ExtraMarksRequest, LocobuzzNG.Entities',
            CreatedDate: moment().utc().toString(),
            UCIC: this.postData.author.socialId,
            Status: this.postData.ticketInfo.status,
            Description: this.checkoutForm.value.remarks,
            Subject:'',
            RecordTypeId:this.RecordTypeId
          };

          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(duraflexRequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
          break;
        }
        case 'tatacapitalcrm':{

          this.checkoutForm.controls['attachments'].setValue(this.AttachmentsList)
          //tatacapitalcrm need to write
          let tataCapitalRequest: TataCapitalRequest;
          tataCapitalRequest = {
            Channel: this.tataCapitalRequest.Channel
              ? this.tataCapitalRequest.Channel
              : ChannelGroup[this.postData.channelGroup],
            ChannelType: this.tataCapitalRequest.ChannelType,
            CreatedBy: this.tataCapitalRequest.CreatedBy,
            FollowerCount: this.tataCapitalRequest.FollowerCount,
            FollowingCount: this.tataCapitalRequest.FollowingCount,
            IsUserFeedback: this.tataCapitalRequest.IsUserFeedback,
            LocobuzChannelGroup: this.postData.channelGroup.toString(),
            LocobuzzTicketID: this.tataCapitalRequest.LocobuzzTicketID,
            LoggedInUserEmailAddress: this.tataCapitalRequest.LoggedInUserEmailAddress,
            Remarks: this.tataCapitalRequest.Remarks,
            SrID: this.tataCapitalRequest.SrID,
            SubChannel: this.tataCapitalRequest.SubChannel,
            TagID: String(this.postData.tagID),
            UserName: this.tataCapitalRequest.UserName,
            UserProfileurl: this.tataCapitalRequest.UserProfileurl,
            $type:
            'LocobuzzNG.Entities.Classes.Crm.BrandCrm.ExtraMarksRequest, LocobuzzNG.Entities',
            UCIC: this.postData.author.socialId,
            RequestType: this.tataCapitalRequest.RequestType,
            FullName: this.checkoutForm.value.fullname,
            EmailAddress: this.checkoutForm.value.emailaddress,
            MobileNumber: this.checkoutForm.value.mobilenumber,
            LoanAccountType: this.checkoutForm.value.loanaccounttype,
            Attachments: this.checkoutForm.value.attachments,
            ProductName: this.checkoutForm.value.productname,
            PostType: this.checkoutForm.value.posttype,
            ConversationLog: '',
            Description: this.checkoutForm.value.conversationlog,
            Sentiments: this.checkoutForm.value.sentiments,
            ComplaintCategory: this.checkoutForm.value.complaintcategory,
            ORMTray: this.checkoutForm.value.ormtray,
            Status: "New",
            SubmittedOn: moment().utc().format('YYYY-MM-DD HH:mm A')
          };
          obj = {
            BrandInfo: this.postData.brandInfo,
            RequestJsonString: JSON.stringify(tataCapitalRequest),
            ClassName: postCRMdata.crmClassName,
            TicketStatus: this.postData.ticketInfo.status,
            ActionStatus: 0,
          };
        }
      }
      this.actionProcessing = true;
      this._crmService.NoLookupCrmRequest(obj).subscribe(
        (res) => {
          this.actionProcessing = false;
          if (
            (res && res.success && res.data && res.data.srID) ||
            ((postCRMdata.crmClassName.toLowerCase() == 'magmacrm' || postCRMdata.crmClassName.toLowerCase() == 'dreamsolcrm' || postCRMdata.crmClassName.toLowerCase() == 'tatacapitalcrm') &&
              res &&
              res.success)
          ) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('SR-Details-Submitted-Successfully'),
              },
            });
            if (!this.postData.ticketInfo.srid && res.data.srID) {
              /* this.ticketService.updateCRMDetails.next({
                TagID: this.postData.tagID,
                SrID: res.data.srID,
                guid: this.navigationService.currentSelectedTab.guid,
                postType: this._postdetailservice.crmPostTye
              }); */
              this.ticketService.updateCRMDetailsSignal.set({
                TagID: this.postData.tagID,
                SrID: res.data.srID,
                guid: this.navigationService.currentSelectedTab.guid,
                postType: this._postdetailservice.crmPostTye
              });
            }
            if (postCRMdata.crmClassName.toLowerCase() == 'tatacapitalcrm')
            {
              /* this.ticketService.updateCRMDetails.next({
                TagID: this.postData.tagID,
                SrID: res.data.srID,
                guid: this.navigationService.currentSelectedTab.guid,
                postType: PostsType.Tickets
              }); */
              this.ticketService.updateCRMDetailsSignal.set({
                TagID: this.postData.tagID,
                SrID: res.data.srID,
                guid: this.navigationService.currentSelectedTab.guid,
                postType: PostsType.Tickets
              });
            }
            this.dialog.closeAll();
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('SR-Details-Submitted-Successfully'),
              },
            });
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: this.translate.instant('SR-Details-Not-Saved-Properly'),
              },
            });
          }
        },
        (err) => {
          this.actionProcessing = false;
          this.disableButton = false;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Something-went-wrong'),
            },
          });
        }
      );
      // console.log(this.checkoutForm.value);
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-enter-required-fields'),
        },
      });
    }
  }

  changefunction(event, FieldName: string): void {
    const parent = this.fields.find((x) => x.Field === FieldName);
    const parentData = parent?.Data?.find((x) => x?.Key == event?.value)
    if (FieldName ==='source'){
      this.source_name = parentData?.Value;
    }
    if (FieldName ==='type'){
      this.type_name = parentData?.Value;
    }
    if (FieldName ==='unit_name'){
      this.unit_name_displayname = parentData?.Value;
    }
    if (parent.IsDependentOnField) {
      this.checkoutForm.controls[
        parent.DependentField.toString().toLowerCase()
      ].enable();
      const Childlistfromparent = parent.Data.find(
        (x) => x.Key === event.value
      );

      const child = this.fields.find((x) => x.Field === parent.DependentField);
      const childList: Datum[] = [];

      for (const childkey of Childlistfromparent.DependentFieldValue) {
        const childobj: Datum = {
          Key: childkey.Key,
          Value: childkey.Value,
          DependentFieldValue: childkey.DependentFieldValue
            ? childkey.DependentFieldValue
            : [],
        };
        childList.push(childobj);
      }

      child.Data = childList;
    }
  }

  changeLookUpType(value: number): void {
    if (value == 1) {
      this.tataUniCrmGroup.controls.mobileNumber.setValidators([
        Validators.required,
        Validators.pattern('^[0][1-9][0-9]{9}$|^[1-9][0-9]{9}$'),
      ]);
      this.tataUniCrmGroup.controls.countrycode.setValue(91);
      this.tataUniCrmGroup.controls.email.removeValidators([]);
      this.mobileView = true;
    } else {
      this.tataUniCrmGroup.controls.mobileNumber.removeValidators([]);
      this.tataUniCrmGroup.controls.email.setValidators([Validators.required]);
      this.tataUniCrmGroup.controls.countrycode.setValue('');
      this.tataUniCrmGroup.controls.email.setValue(this.data?.author?.locoBuzzCRMDetails?.emailID ? this.data?.author?.locoBuzzCRMDetails?.emailID : '')
      this.mobileView = false;
    }
  }

  submit(): void {
    if ((this.tataUniCrmGroup.value.mobileNumber != this.data?.author?.locoBuzzCRMDetails?.phoneNumber && this.tataUniCrmGroup.value.type == 1) || (this.tataUniCrmGroup.value.email != this.data?.author?.locoBuzzCRMDetails?.emailID && this.tataUniCrmGroup.value.type == 2)) {
      if (
        this.tataUniCrmGroup.value.type == 1 &&
        this.tataUniCrmGroup.controls.mobileNumber.invalid
      ) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Please-enter-valid-mobile-number'),
          },
        });
        return;
      }
      if (this.tataUniCrmGroup.value.type == 2) {
        const emailval =
          /^([a-zA-Z0-9_&\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!emailval.test(this.tataUniCrmGroup.controls.email.value.trim())) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Please-enter-valid-email-address'),
            },
          });
          return;
        }
      }
    }
    
    let selectedType;
    if(this.tataUniCrmGroup.value['type'] == 1){
      selectedType = this.data?.author?.crmColumns?.existingColumns.filter((x) => x.dbColumn == "PhoneNumber");
    } else if (this.tataUniCrmGroup.value['type'] == 2){
      selectedType = this.data?.author?.crmColumns?.existingColumns.filter((x) => x.dbColumn == "EmailID");
    }
    const obj = {
      countrycode: `+${this.tataUniCrmGroup.controls.countrycode.value}`,
      mobileNumber: this.tataUniCrmGroup.controls.mobileNumber.value,
      email: this.tataUniCrmGroup.controls.email.value,
      MAPID: this.data?.author?.locoBuzzCRMDetails?.id,
      OrderID: selectedType[0].orderID,
      ColumnLable: selectedType[0].columnLable,
      IsMaskingEnabled: selectedType[0].isMaskingEnabled,
    };
    this.tataUniLoader = true;
    this._crmService.GetTataUniCrmLookup(obj).subscribe(
      (res) => {
        this.tataUniLoader = false;
        if (res.success) {
          if (res.data && res.data.customerDetails.id) {
            this.dialogRef.close(res.data);
          } else {
            this.disableButton = false;
            this.tatauniCrmFlag = false;
            this.checkoutForm.enable();
            this.checkoutForm.controls['emailaddress'].setValue(this.data?.author?.locoBuzzCRMDetails?.emailID ? this.data?.author?.locoBuzzCRMDetails?.emailID : null);
            this.checkoutForm.controls['mobilenumber'].setValue(this.data?.author?.locoBuzzCRMDetails?.phoneNumber ? this.data?.author?.locoBuzzCRMDetails?.phoneNumber : null);
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('No-Data-Found'),
              },
            });
          }
        } else {
          this.disableButton = false;
          this.checkoutForm.enable();
        }
      },
      (err) => {
        this.tataUniLoader = false;
      }
    );
  }

  userProfileLinkEmitRes(event) {
    if (event) {
      this.UserProfileurl = event;
    }
  }

  ngAfterViewInit(): void {
    if (this._crmService.newMentionFound) {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.inputRef.first['nativeElement'].blur();
        }, 300);
      });
      // this.inputRef..blur();
    }
  }


  //country code
  searchCountryCode(value) {
    this.countryCodeList = this.countryCodeListCopy;
    let filter = value.toLowerCase();
    let array: any[] = [];
    if (value.length > 0) {
      for (let i = 0; i < this.countryCodeListCopy.length; i++) {
        let option = this.countryCodeListCopy[i];
        if (
          (
            option.country?.toLowerCase() +
            ' +' +
            option.code.toString()
          ).indexOf(filter) >= 0 &&
          filter != ''
        ) {
          array.push(option);
        }
      }
      this.countryCodeList = array;
    } else {
      this.countryCodeList = this.countryCodeListCopy;
    }
  }
  countryChangeAction(country) {
    this.selectedCountry = country;
    this.selectedCountryLength =
      14 - this.selectedCountry.code.toString().length;
  }
  closeCountryList() {
    this.countryCodeSearchCtrl.setValue('');
    this.countryCodeList = this.countryCodeListCopy;
    this.noMatchFound = false;
  }
  _handleKeydown(event: KeyboardEvent) {
    if (event.keyCode === 32) {
      // do not propagate spaces to MatSelect, as this would select the currently active option
      event.stopPropagation();
    }
  }

  onChange(event) {
    if(!this.AttachmentsList){
      this.AttachmentsList = [];
    }
    if (this.AttachmentsList.length>4){
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Maximum-number-allowed'),
        },
      });
      return;
    }
    if (event.target.files[0].type.includes('image/') && event.target.files[0].type != 'image/gif') {
    this.fileToBase64(event.srcElement.files[0]).then((result) => {
      let obj = {
        'Title': event.srcElement.files[0].name,
        'VersionData': result.replace('data:', '').replace(/^.+,/, '')
      }
      this.AttachmentsList.push(obj)
    })
  }
     else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Incorrect-file-type'),
        },
      });
      return;
    }

  }

  fileToBase64 = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.toString());
      reader.onerror = (error) => reject(error);
    });
  };
  deleteAttachment(img){
    const attachmentIndex = this.AttachmentsList.findIndex(item => item.VersionData == img.VersionData);
    if (attachmentIndex !== -1) {
      this.AttachmentsList.splice(attachmentIndex, 1);
    }
  }
}

