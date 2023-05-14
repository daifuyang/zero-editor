import React, { Component } from 'react';
import { Editor } from '@tinymce/tinymce-react';
// import classNames from 'classnames';

interface EditSetterProps {
  // 当前值
  value: string;
  // 默认值
  defaultValue: string;
  // setter 唯一输出
  onChange: (val: string) => void;
  // AltStringSetter 特殊配置
  placeholder: string;
}

class EditSetter extends React.PureComponent<EditSetterProps> {
  // 声明 Setter 的 title
  static displayName = 'EditSetter';
  comRef = null;

  constructor(props:any) {
    super(props);
    this.state = {
      initialValue: ""
    };
  }

  
  componentDidMount() {
    const { onChange, value, defaultValue } = this.props;
    this.setState({
      initialValue: value,
    });
    if (value == undefined && defaultValue) {
      onChange(defaultValue);
    }
  }

  isSmallScreen: any = window.matchMedia('(max-width: 1023.5px)').matches;

  render() {
    const { defaultValue, onChange, value, placeholder } = this.props;
    const { initialValue } = this.state as any
    return (
      <Editor
        initialValue={initialValue}
        tinymceScriptSrc={'/script/tinymce/tinymce.min.js'}
        onInit={(evt, editor: any) => {
          this.comRef = editor;
        }}
        onEditorChange={(a: string, editor) => {
          onChange(a);
        }}
        init={{
          language_url: 'script/tinymce/langs/zh-Hans.js',
          language: 'zh-Hans',
          height: 300,
          plugins:
            'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
          menubar: 'file edit view insert format tools table help',
          toolbar:
            'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
          quickbars_selection_toolbar: 'bold italic | blocks | quicklink blockquote',
          quickbars_insert_toolbar: 'quickimage quicktable | hr',
          toolbar_sticky: true,
          toolbar_sticky_offset: this.isSmallScreen ? 102 : 108,
        }}
      />
    );
  }
}

export default EditSetter;
