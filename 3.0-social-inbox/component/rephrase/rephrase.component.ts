
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AiActionActiveImageEnum } from 'app/core/enums/AiActionActiveImageEnum';
import { AiActionEnum } from 'app/core/enums/AiActionEnum';
import { AiActionInactiveImageEnum } from 'app/core/enums/AiActionInactiveImageEnum';
import { AIRephraseActions } from 'app/core/interfaces/AIFeatureInterface';
import { TextAreaCount } from 'app/core/models/dbmodel/TicketReplyDTO';
import { ChatBotService } from 'app/social-inbox/services/chatbot.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-rephrase',
    templateUrl: './rephrase.component.html',
    styleUrls: ['./rephrase.component.scss'],
    standalone: false
})
export class RephraseComponent implements OnInit, OnDestroy {
  @Input() rephraseOptions:any;
  @Input() aiAutoResponse: boolean = false;
  @Input() isFromEmailPopUp:boolean = false;
  settingOption:string = '';
  messageTone:string = '';
  messageManner:string = '';
  promptText:string = ''
  rephraseText:string = ''
  searchText:string =''
  rephraseLoader: boolean = false;
  aiSuggestionLoader: boolean;
  subs = new SubSink();

  rephraseAction: AIRephraseActions []=[];
  rephraseActionEnum = AiActionEnum
  rephraseActiveImage = AiActionActiveImageEnum
  rephraseInActiveImage = AiActionInactiveImageEnum
  
  // openRephrasePopup: boolean = false;
  language: string[] = ['Hindi',
    'Bengali',
    'Marathi',
    'Telugu',
    'Tamil',
    'Gujarati',
    'Urdu',
    'Kannada',
    'Odia',
    'Malayalam',
    'Punjabi',
    'Chinese',
    'Sindhi',
    'Greek',
    'Japanese',
    'Korean',
    'Nepali',
    'Thai',
    'Filipino',
    'Assamese',
    'Danish',
    'German',
    'English',
    'Irish',
    'Italian',
    'Dutch',
    'Oriya',
    'Polish',
    'Portuguese',
    'Russian',
    'Turkish',
    'Ukrainian',
    'Arabic',
    'Spanish',
    'Bahasa',
    'Sinhala',
    'Asturian',
    'Bihari',
    'French',
    'Swedish',
    'Vietenemes',
    'Tagalog',
    'Cebuano']
  languageCopy:string[] = []
  selectedLanguageTo:string = ''
  undoArr = []
  redoArr = []
  promptIconSrc = "assets/images/media/replyRephrase__prompt.svg";
  isPrompt:boolean = false;
  constructor(private _postDetailService: PostDetailService, 
    private _chatBotService: ChatBotService,
    private _aiFeatureService: ChatBotService,
    public cdr: ChangeDetectorRef,
    private replyService: ReplyService,) { }

  ngOnInit(): void {
    this.isPrompt = false;
    // console.log('options: ', this.rephraseOptions)
    if(this.rephraseOptions){
      Object.keys(this.rephraseOptions.rephraseActions).forEach(key => {
        // console.log(key);
        const iconActiveSrc = this.rephraseOptions.rephraseActions[key].icon > 0 ? this.rephraseActiveImage[this.rephraseActionEnum[this.rephraseOptions.rephraseActions[key].icon]] : this.rephraseOptions.rephraseActions[key]?.path;
        const iconInactiveSrc = this.rephraseOptions.rephraseActions[key].icon > 0 ? this.rephraseInActiveImage[this.rephraseActionEnum[this.rephraseOptions.rephraseActions[key].icon]] : this.rephraseOptions.rephraseActions[key]?.path;
        const obj= {
          type: key,
          icon: this.rephraseOptions.rephraseActions[key]?.icon,
          name: this.rephraseOptions.rephraseActions[key]?.name,
          prompt: this.rephraseOptions.rephraseActions[key]?.prompt,
          path: this.rephraseOptions.rephraseActions[key]?.path,
          iconActive: iconActiveSrc,
          iconInactive: iconInactiveSrc,
        }
        this.rephraseAction.push(obj);
      });
    }
    this.languageCopy = this.language
    this.subs.add(
      this.replyService.rephraseLoader.subscribe(res =>{
        this.rephraseLoader=res;
        if(!res){
          this.messageManner ='';
          this.messageTone ='';
          this.promptText = '';
        }
      })
    )
    this.subs.add(
      this.replyService.undoredoChanged.subscribe(res => {
        if(res.status){
          this.undoArr = this.replyService.undoArr
          this.redoArr = this.replyService.redoArr
          this.selectedLanguageTo = res.language
        }
      })
    )
  }

  undoRedoRephrase(val){
      const obj = {
        value: val,
        isNotFromInsertPopover: this.aiAutoResponse ? false : true
      }
    this.replyService.undoRedoRephrase.next(obj);
  }


  applyRephraseData() {
    const obj= {
      language: this.selectedLanguageTo,
      settingOption: this.settingOption,
      messageManner:this.messageManner,
      messageTone: this.messageTone,
      promptText:this.promptText,
      isNotFromInsertPopover: this.aiAutoResponse ? false : true,
    }

    if(this.isFromEmailPopUp){
      obj['isFromEmailPopUp'] = this.isFromEmailPopUp
    }
    this.isPrompt = false;
    this.replyService.applyRephrase.next(obj);
  }

  selectLanguageTo(value) {
    this.selectedLanguageTo = value.value
    this.settingOption = 'Translate'
    this.applyRephraseData()
  }

  searchRephraseLanguage(value) {
    this.language = this.languageCopy;
    const filterValue = value && value.length > 0 ? value.toLowerCase() : '';
    this.language = this.languageCopy.filter((option) =>
      filterValue && filterValue.length > 0
        ? option.toLowerCase().includes(filterValue)
        : this.languageCopy
    );
  }

  removeData(){
    this.searchText = '';
    this.searchRephraseLanguage(this.searchText);
  }

  selectRephraseOption(index){
    this.messageManner = this.rephraseAction[index]?.name;
    this.promptText = this.rephraseAction[index]?.prompt;
    this.settingOption = 'Rephrase';
    this.applyRephraseData();
  }

  ngOnDestroy(): void {
    this.cdr.detach();
    this.subs.unsubscribe();
  }
}
